// src/lib/contractService.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ethers, BrowserProvider, Contract } from 'ethers'; // Import from ethers v6
import AutomatedPortfolioABI from '../abi/AutomatedPortfolio.json';
import TestUSDCABI from '../abi/TestUSDC.json';

// Contract addresses from environment variables
export const PORTFOLIO_CONTRACT_ADDRESS = (import.meta.env.VITE_PORTFOLIO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const USDC_CONTRACT_ADDRESS = (import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Debug logging for contract addresses
console.log('🔧 Contract Configuration:', {
  portfolioContract: PORTFOLIO_CONTRACT_ADDRESS,
  usdcContract: USDC_CONTRACT_ADDRESS,
  isValidPortfolio: PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
  isValidUsdc: USDC_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
});

// Interface for portfolio allocation
export interface Allocation {
  id: string;
  name: string;
  color: string;
  allocation: number;
}

// Default category colors and names for UI display
export const categoryColors: Record<string, string> = {
  'ai': '#8B5CF6',
  'meme': '#EC4899',
  'rwa': '#0EA5E9',
  'bigcap': '#10B981',
  'defi': '#F59E0B',
  'l1': '#EF4444',
  'stablecoin': '#14B8A6',
};

export const categoryNames: Record<string, string> = {
  'ai': 'AI & DeFi',
  'meme': 'Meme & NFT',
  'rwa': 'RWA',
  'bigcap': 'Big Cap',
  'defi': 'DeFi',
  'l1': 'Layer 1',
  'stablecoin': 'Stablecoins',
};

// Direct contract interaction using ethers.js v6
export const updateAllocations = async (allocations: Allocation[]) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    console.log('Starting direct contract interaction with allocations:', allocations);
    
    // Request account access explicitly
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get the provider and signer - ethers v6 syntax
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Connected with address:', userAddress);
    
    // Create contract instance - ethers v6 syntax
    const contract = new Contract(
      PORTFOLIO_CONTRACT_ADDRESS,
      AutomatedPortfolioABI,
      signer
    );
    
    // Prepare the data for the contract call
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => a.allocation);
    
    console.log('Calling contract with:', {
      userAddress,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      categories,
      percentages
    });
    
    // Estimate gas first to check if the transaction will succeed
    try {
      const gasEstimate = await contract.updateAllocations.estimateGas(categories, percentages);
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      throw new Error(`Transaction would fail: ${gasError instanceof Error ? gasError.message : 'Unknown error'}`);
    }
    
    // Call the contract function with explicit gas limit - ethers v6 syntax
    const tx = await contract.updateAllocations(categories, percentages, {
      gasLimit: 300000 // ethers v6 accepts number directly
    });
    
    console.log('Transaction sent:', tx);
    
    return {
      hash: tx.hash as `0x${string}`
    };
  } catch (error) {
    console.error('Error in updateAllocations:', error);
    throw error;
  }
};

// Hook to read allocations from the contract
export function usePortfolioAllocations() {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'getAllocations',
    query: {
      enabled: PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Map contract data to our application format
  const processData = () => {
    if (!data) return [];
    
    try {
      const [categories, percentages] = data as [string[], bigint[]];
      
      return categories.map((category, index) => ({
        id: category,
        name: categoryNames[category] || category,
        color: categoryColors[category] || '#6B7280',
        allocation: Number(percentages[index])
      }));
    } catch (error) {
      console.error('Error processing allocation data:', error);
      return [];
    }
  };
  
  return {
    allocations: processData(),
    isLoading,
    isError,
    refetch
  };
}

// Function to check if an address is the contract owner
export function useIsContractOwner() {
  const { address } = useAccount();
  
  const { data, isLoading, isError } = useReadContract({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'owner',
    query: {
      enabled: !!address && PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Check if the connected address is the owner
  const isOwner = address && data ? address.toLowerCase() === (data as string).toLowerCase() : false;
  
  return {
    isOwner,
    isLoading,
    isError,
    ownerAddress: data as string
  };
}

// Hook to update allocations on the contract (using direct ethers.js)
export function useUpdateAllocations() {
  const { address, isConnected } = useAccount();
  const { isOwner } = useIsContractOwner();
  
  console.log('useUpdateAllocations init:', {
    address,
    isConnected,
    isOwner,
    contractAddress: PORTFOLIO_CONTRACT_ADDRESS
  });

  const updateAllocationsFn = async (allocations: Allocation[]) => {
    console.log('updateAllocations called with:', {
      allocations,
      isConnected,
      address,
      isOwner,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS
    });

    // Check if wallet is connected
    if (!isConnected || !address) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Check if contract address is valid
    if (!PORTFOLIO_CONTRACT_ADDRESS || PORTFOLIO_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid contract address. Please check your environment variables.');
    }

    // Check if user is the owner
    if (!isOwner) {
      console.warn('User is not the contract owner:', {
        userAddress: address,
        contractAddress: PORTFOLIO_CONTRACT_ADDRESS
      });
      throw new Error('You are not the owner of this contract. Only the owner can update allocations.');
    }

    // Use direct ethers.js approach for better reliability
    console.log('Using direct ethers.js approach for contract interaction');
    return updateAllocations(allocations);
  };

  return {
    updateAllocations: updateAllocationsFn,
    isPending: false,
    error: null,
    isSuccess: false,
    transaction: null,
    isOwner
  };
}

// Hook to wait for transaction receipt
export function useTransactionReceipt(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(hash: string) {
  const explorerUrl = import.meta.env.VITE_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com';
  return `${explorerUrl}/tx/${hash}`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(address: string) {
  const explorerUrl = import.meta.env.VITE_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com';
  return `${explorerUrl}/address/${address}`;
}

// USDC Contract Functions

// Hook to get USDC balance
export function useUSDCBalance(address?: string) {
  return useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: TestUSDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });
}

// Hook to get USDC faucet function (simplified)
export function useUSDCFaucet() {
  return {
    claimUSDC: async () => {
      // Use direct ethers.js approach for better compatibility
      if (!(window as any).ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }
      
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(USDC_CONTRACT_ADDRESS, TestUSDCABI, signer);
      
      return await contract.faucet();
    },
  };
}

// Hook to get USDC allowance
export function useUSDCAllowance(owner?: string, spender?: string) {
  return useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: TestUSDCABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
    }
  });
}

// Hook to approve USDC spending (simplified)
export function useUSDCApprove() {
  return {
    approve: async (spender: string, amount: bigint) => {
      // Use direct ethers.js approach for better compatibility
      if (!(window as any).ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }
      
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(USDC_CONTRACT_ADDRESS, TestUSDCABI, signer);
      
      return await contract.approve(spender, amount);
    },
  };
}
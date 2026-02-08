// src/lib/explorerService.ts
import axios from 'axios';

// Use the Monad testnet explorer API
// Note: Using Blockvision API as primary source, fallback to mock data
const EXPLORER_API_URL = 'https://api.blockvision.org/v2/monad';
const MONAD_EXPLORER_URL = 'https://testnet.monadexplorer.com';

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
  decimals?: number;
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: number | string;
  age: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  type: 'buy' | 'sell' | 'transfer';
  usdValue?: string;
  isMock?: boolean; // Add this property to support mock data flag
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  holders: number;
  type: string;
}

// Get token transfers
export async function getTokenTransfers(
  page = 1, 
  limit = 100,
  tokenAddress?: string,
  fromTimestamp?: number
): Promise<TokenTransfer[]> {
  try {
    // For Monad testnet, we'll use mock data since full API integration is pending
    // Future implementation will use Blockvision Monad API endpoints
    console.log('getTokenTransfers: Using mock data for Monad testnet');
    return generateMockTokenTransfers(page, limit, tokenAddress, fromTimestamp);
  } catch (error) {
    console.error(`Error fetching token transfers:`, error);
    return [];
  }
}

// Generate mock token transfers for Monad testnet
function generateMockTokenTransfers(
  page: number, 
  limit: number, 
  tokenAddress?: string, 
  fromTimestamp?: number
): TokenTransfer[] {
  const tokens = getMockTopTokens();
  const transfers: TokenTransfer[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < limit; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    
    // Skip if specific token requested and this isn't it
    if (tokenAddress && token.address !== tokenAddress) {
      continue;
    }
    
    // Random timestamp within last 24 hours or from specified time
    const randomTime = fromTimestamp ? 
      fromTimestamp + (Math.random() * (now - fromTimestamp)) : 
      now - (Math.random() * 24 * 60 * 60);
    
    transfers.push({
      hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      from: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      to: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      value: BigInt(Math.floor(Math.random() * 1000000 * 10**18)).toString(),
      timestamp: randomTime,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      tokenAddress: token.address,
      decimals: token.decimals
    });
  }
  
  return transfers.sort((a, b) => b.timestamp - a.timestamp);
}

// Legacy function kept for compatibility - now uses Blockvision structure
export async function getTokenTransfersLegacy(
  page = 1, 
  limit = 100,
  tokenAddress?: string,
  fromTimestamp?: number
): Promise<TokenTransfer[]> {
  try {
    const params: any = {
      cursor: '', // Blockvision uses cursor-based pagination
      limit: limit
    };
    
    if (tokenAddress) {
      params.contractAddress = tokenAddress; // Blockvision parameter name
    }
    
    // Note: Blockvision API would be called here in production
    // const response = await axios.get(`${EXPLORER_API_URL}/account/tokens`, { 
    //   params,
    //   headers: { 'X-API-KEY': process.env.VITE_BLOCKVISION_API_KEY }
    // });
    
    // Fallback to mock data for now
    return generateMockTokenTransfers(page, limit, tokenAddress, fromTimestamp);
  } catch (error) {
    console.error(`Error fetching token transfers:`, error);
    return generateMockTokenTransfers(page, limit, tokenAddress, fromTimestamp);
  }
}

// Get token information for Monad testnet
export async function getTokenInfo(tokenAddress: string): Promise<any> {
  try {
    // For Monad testnet, return mock token info
    const tokens = getMockTopTokens();
    const token = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    
    if (token) {
      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        totalSupply: token.totalSupply,
        holders: token.holders,
        type: token.type,
        // Additional Monad-specific fields
        network: 'Monad Testnet',
        chainId: 10143,
        explorer: `${MONAD_EXPLORER_URL}/token/${token.address}`
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}

// Get top tokens
export async function getTopTokens(limit = 10): Promise<Token[]> {
  try {
    // For Monad testnet, we'll use mock data since the API might not have a direct endpoint for top tokens
    return getMockTopTokens();
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return getMockTopTokens();
  }
}

// Get whale transactions
export async function getWhaleTransactions(
  timeframe: '24h' | '3d' | '7d',
  tokenFilter: string = 'all',
  limit = 100
): Promise<WhaleTransaction[]> {
  try {
    // Calculate timestamp based on timeframe
    const now = Math.floor(Date.now() / 1000);
    let fromTimestamp: number;
    
    switch (timeframe) {
      case '24h':
        fromTimestamp = now - (24 * 60 * 60);
        break;
      case '3d':
        fromTimestamp = now - (3 * 24 * 60 * 60);
        break;
      case '7d':
        fromTimestamp = now - (7 * 24 * 60 * 60);
        break;
      default:
        fromTimestamp = now - (24 * 60 * 60);
    }
    
    try {
      // Get token transfers
      const params: any = {
        page: 1,
        items_count: 200, // Get more items to filter down later
        from_timestamp: fromTimestamp
      };
      
      // If a specific token is selected, add it to the params
      if (tokenFilter !== 'all') {
        const tokens = getMockTopTokens();
        const token = tokens.find(t => t.symbol === tokenFilter);
        if (token) {
          params.token = token.address;
        }
      }
      
      // For Monad testnet, use mock data
      // Future: const response = await axios.get(`${EXPLORER_API_URL}/account/transactions`, { 
      //   params, headers: { 'X-API-KEY': process.env.VITE_BLOCKVISION_API_KEY }
      // });
      
      console.log('getWhaleTransactions: Using mock data for Monad testnet');
      throw new Error('Using mock data for Monad testnet');

      
      // This will be skipped since we throw an error above to go to catch block
    } catch (apiError) {
      console.error('API error, using mock data:', apiError);
      // Generate mock whale transactions for Monad testnet
      return generateMockWhaleTransactions(getMockTopTokens(), timeframe);
    }
  } catch (error) {
    console.error('Error in getWhaleTransactions:', error);
    return [];
  }
}

// Format large numbers for display
export function formatValue(value: string, decimals = 18): string {
  try {
    const valueBigInt = BigInt(value);
    const divisor = BigInt(10) ** BigInt(decimals);
    
    if (valueBigInt === BigInt(0)) return '0';
    
    // Handle case where value is less than 1
    if (valueBigInt < divisor) {
      const fractionalPart = valueBigInt.toString().padStart(decimals, '0');
      // Find first non-zero digit
      let firstNonZero = 0;
      for (let i = 0; i < fractionalPart.length; i++) {
        if (fractionalPart[i] !== '0') {
          firstNonZero = i;
          break;
        }
      }
      
      // Return with appropriate precision
      return `0.${fractionalPart.substring(0, firstNonZero + 4)}`;
    }
    
    // For values >= 1
    const wholePart = valueBigInt / divisor;
    const fractionalPart = valueBigInt % divisor;
    
    // Format the fractional part to have leading zeros
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    // Trim trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, '');
    
    // Format whole part with commas
    const wholePartStr = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Only show fractional part if it's not zero
    return fractionalStr ? `${wholePartStr}.${fractionalStr.substring(0, 4)}` : wholePartStr;
  } catch (e) {
    console.error('Error formatting value:', e);
    return '0';
  }
}

// Calculate how long ago a timestamp was
export function timeAgo(timestamp: number | string | undefined | null): string {
  // Handle invalid timestamps
  if (!timestamp) {
    return 'Recently';
  }
  
  let date: Date;
  
  // Handle string ISO timestamps (from API)
  if (typeof timestamp === 'string') {
    try {
      date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
    } catch (e) {
      return 'Recently';
    }
  } else if (typeof timestamp === 'number') {
    // Handle numeric Unix timestamps
    // Check if it's in seconds (Unix timestamp) or milliseconds
    if (timestamp > 1000000000000) {
      // Timestamp is in milliseconds
      date = new Date(timestamp);
    } else {
      // Timestamp is in seconds
      date = new Date(timestamp * 1000);
    }
    
    if (isNaN(date.getTime())) {
      return 'Recently';
    }
  } else {
    return 'Recently';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  
  // Handle invalid or future timestamps
  if (seconds < 0) {
    return 'Just now';
  }
  
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Mock function to calculate USD value - Monad ecosystem pricing
function calculateMockUsdValue(amount: string, symbol: string): string {
  // Remove commas from formatted amount
  const cleanAmount = amount.replace(/,/g, '');
  let price = 0;
  
  // Mock prices - MON as primary native token, USDC as stable reference
  switch (symbol) {
    case 'MON':
      price = 2.50; // MON at $2.50
      break;
    case 'USDC':
    case 'USDT':
    case 'MDAI':
      price = 1.00; // Stablecoins
      break;
    case 'WMON':
      price = 2.48; // Wrapped MON slightly discounted
      break;
    case 'MBTC':
      price = 65000; // Monad Bitcoin
      break;
    case 'METH':
      price = 3600; // Monad Ether
      break;
    case 'MLINK':
      price = 16.50; // Monad Link
      break;
    case 'MUNI':
      price = 9.25; // Monad Uniswap
      break;
    case 'MAAVE':
      price = 145; // Monad AAVE
      break;
    case 'MCOMP':
      price = 85; // Monad Compound
      break;
    default:
      // Random price for other tokens in Monad ecosystem
      price = 0.5 + (Math.random() * 2.0); // $0.50 - $2.50 range
  }
  
  try {
    const usdValue = parseFloat(cleanAmount) * price;
    return usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    });
  } catch (e) {
    return '$0.00';
  }
}

// Function to generate mock top tokens - MON prioritized for Monad network
function getMockTopTokens(): Token[] {
  return [
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Monad',
      symbol: 'MON',
      totalSupply: '10000000000000000000000000', // 10M MON
      decimals: 18,
      holders: 15420,
      type: 'Native'
    },
    {
      address: '0xF76Bb2A92d288f15bF17C405Ae715f8d1cedB058',
      name: 'USD Coin (Monad)',
      symbol: 'USDC',
      totalSupply: '1000000000000',
      decimals: 6,
      holders: 8500,
      type: 'ERC20'
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      symbol: 'WMON',
      name: 'Wrapped Monad',
      totalSupply: '5000000000000000000000000', // 5M WMON
      decimals: 18,
      holders: 3200,
      type: 'ERC20'
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      symbol: 'MBTC',
      name: 'Monad Bitcoin',
      totalSupply: '21000000000000000000', // 21M MBTC
      decimals: 18,
      holders: 2800,
      type: 'ERC20'
    },
    {
      address: '0x4567890123456789012345678901234567890123',
      symbol: 'USDT',
      name: 'Tether USD',
      totalSupply: '78000000000000000',
      decimals: 6,
      holders: 3200,
      type: 'ERC20'
    },
    {
      address: '0x5678901234567890123456789012345678901234',
      symbol: 'METH',
      name: 'Monad Ether',
      totalSupply: '43000000000000000000000',
      decimals: 18,
      holders: 2400,
      type: 'ERC20'
    },
    {
      address: '0x6789012345678901234567890123456789012345',
      symbol: 'MLINK',
      name: 'Monad Link',
      totalSupply: '1000000000000000000000',
      decimals: 18,
      holders: 1900,
      type: 'ERC20'
    },
    {
      address: '0x7890123456789012345678901234567890123456',
      symbol: 'MUNI',
      name: 'Monad Uniswap',
      totalSupply: '1000000000000000000000',
      decimals: 18,
      holders: 1700,
      type: 'ERC20'
    },
    {
      address: '0x8901234567890123456789012345678901234567',
      symbol: 'MDAI',
      name: 'Monad DAI',
      totalSupply: '32000000000000000000000',
      decimals: 18,
      holders: 1500,
      type: 'ERC20'
    },
    {
      address: '0x9012345678901234567890123456789012345678',
      symbol: 'MAAVE',
      name: 'Monad AAVE',
      totalSupply: '16000000000000000000000',
      decimals: 18,
      holders: 1300,
      type: 'ERC20'
    },
    {
      address: '0x0123456789012345678901234567890123456789',
      symbol: 'MCOMP',
      name: 'Monad Compound',
      totalSupply: '10000000000000000000000',
      decimals: 18,
      holders: 1100,
      type: 'ERC20'
    }
  ];
}

// Function to generate mock whale transactions
function generateMockWhaleTransactions(tokens: Token[], timeframe: string): WhaleTransaction[] {
  const now = Math.floor(Date.now() / 1000);
  const mockTransactions: WhaleTransaction[] = [];
  
  // Generate 3-5 transactions for each token
  tokens.forEach(token => {
    const transactionCount = 3 + Math.floor(Math.random() * 3); // 3-5 transactions
    
    for (let i = 0; i < transactionCount; i++) {
      // Random transaction type
      const typeOptions: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
      
      // Random value based on token - MON gets highest transaction volumes as native token
      const baseValue = Math.random() * 100000; // Base value between 0 and 100,000
      const valueMultiplier = token.symbol === 'MON' ? 25 : token.symbol === 'USDC' ? 15 : token.symbol === 'WMON' ? 20 : 1;
      const value = baseValue * valueMultiplier;
      
      // Random timestamp within the timeframe
      let timeframeHours: number;
      switch (timeframe) {
        case '3d':
          timeframeHours = 72;
          break;
        case '7d':
          timeframeHours = 168;
          break;
        default:
          timeframeHours = 24;
      }
      
      const randomHoursAgo = Math.random() * timeframeHours;
      const date = new Date(Date.now() - (randomHoursAgo * 60 * 60 * 1000));
      const timestamp = date.toISOString(); // Use ISO string format to match API
      
      // Generate random addresses
      const from = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const to = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Create mock transaction
      mockTransactions.push({
        hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        from,
        to,
        value: BigInt(Math.floor(value * 10**18)).toString(),
        valueFormatted: value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        timestamp: timestamp,
        age: timeAgo(timestamp),
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenAddress: token.address,
        type,
        usdValue: calculateMockUsdValue(value.toLocaleString(undefined, { maximumFractionDigits: 2 }), token.symbol),
        isMock: true // Mark as mock data
      });
    }
  });
  
  // Sort by timestamp (most recent first)
  return mockTransactions.sort((a, b) => {
    const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
    const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
    return bTime - aTime;
  });
}
// src/components/PortfolioOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, Droplets, WalletIcon, Coins, DollarSign, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useAccount, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'ethers'; // Import formatEther directly for ethers v6
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { modal } from '@/lib/appkit';
import { useUSDCFaucet } from '@/lib/contractService';
import PremiumGoldLottie from '@/components/PremiumGoldLottie';
import GfVx5PnDyJLottie from '@/components/GfVx5PnDyJLottie';

const PortfolioOverview = () => {
  const { allocations, refreshAllocations } = useBlockchain();
  const { address, isConnected } = useAccount();
  
  // USDC contract address from environment
  const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS;
  
  // Use wagmi's useBalance hook for MON (native token)
  const { data: monBalanceData, isLoading: isMonBalanceLoading } = useBalance({
    address: address,
  });
  
  // Use wagmi's useBalance hook for USDC (ERC20 token)
  const { data: usdcBalanceData, isLoading: isUsdcBalanceLoading } = useBalance({
    address: address,
    token: USDC_CONTRACT_ADDRESS as `0x${string}`,
  });
  
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [monPrice, setMonPrice] = useState(3.294); // Current MON price from Crystal Exchange markets
  const [usdcPrice, setUsdcPrice] = useState(1.00); // USDC is pegged to $1
  const [isClaimingUSDC, setIsClaimingUSDC] = useState(false);
  
  const isPositive = portfolioChange > 0;
  
  // Initialize USDC faucet hook
  const { claimUSDC } = useUSDCFaucet();
  
  // Refresh allocations on mount
  useEffect(() => {
    refreshAllocations();
  }, [refreshAllocations]);
  
  // Fetch MON price from Crystal Exchange markets data
  useEffect(() => {
    const fetchMonPrice = async () => {
      try {
        // Current MON/USDC rate from Crystal Exchange markets: 3.294
        // Based on $715,262.67 volume with +0.27% change
        const currentMonPrice = 3.294;
        
        console.log('Using current MON price from Crystal Exchange markets:', currentMonPrice);
        setMonPrice(currentMonPrice);
        
        // Note: In production, this could fetch from Crystal Exchange API
        // or other DEX price oracles on Monad network
        
      } catch (error) {
        console.error('Error in fetchMonPrice function:', error);
        // Keep default price of 3.294 USDC based on market data
        setMonPrice(3.294);
      }
    };
    
    fetchMonPrice();
    
    // Refresh price every 5 minutes (in production, could be more frequent)
    const intervalId = setInterval(fetchMonPrice, 300000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate portfolio value when balance or price changes
  useEffect(() => {
    if (!isConnected || !address) {
      setPortfolioValue(0);
      setPortfolioChange(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(isMonBalanceLoading || isUsdcBalanceLoading);
    
    if (monBalanceData || usdcBalanceData) {
      try {
        let totalValue = 0;
        
        // Calculate MON value
        if (monBalanceData) {
          const monBalance = parseFloat(formatEther(monBalanceData.value));
          totalValue += monBalance * monPrice;
        }
        
        // Calculate USDC value
        if (usdcBalanceData) {
          const usdcBalance = parseFloat(formatUnits(usdcBalanceData.value, usdcBalanceData.decimals));
          totalValue += usdcBalance * usdcPrice;
        }
        
        // Set portfolio value
        setPortfolioValue(totalValue);
        
        // Generate a realistic portfolio change (mock data)
        const randomChange = (Math.random() * 20) - 10; // -10% to +10%
        setPortfolioChange(parseFloat(randomChange.toFixed(2)));
        
        // Update last updated time
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error calculating portfolio value:', error);
        setPortfolioValue(0);
        setPortfolioChange(0);
      }
    }
  }, [monBalanceData, usdcBalanceData, isMonBalanceLoading, isUsdcBalanceLoading, isConnected, address, monPrice, usdcPrice]);
  
  // Format the portfolio data from allocations
  const portfolioData = allocations.map(item => ({
    name: item.name,
    value: item.allocation,
    color: item.color
  }));
  
  // Default data for disconnected state
  const defaultPortfolioData = [
    { name: 'Connect Wallet', value: 100, color: '#6B7280' }
  ];
  
  const handleConnectWallet = () => {
    if (modal) {
      modal.open();
    }
  };

  // Handle USDC faucet claim
  const handleClaimUSDC = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim USDC tokens.",
        variant: "destructive"
      });
      return;
    }

    setIsClaimingUSDC(true);
    
    try {
      const tx = await claimUSDC();
      
      toast({
        title: "USDC Claim Transaction Sent!",
        description: "Your USDC claim transaction has been submitted. Please wait for confirmation.",
      });

      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "USDC Claimed Successfully!",
        description: "1000 USDC has been added to your wallet.",
      });

      // Refresh the page data
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error claiming USDC:', error);
      
      let errorMessage = "Please try again later.";
      
      if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient MON for gas fees.";
      } else if (error.message?.includes("cooldown")) {
        errorMessage = "You must wait before claiming again.";
      }
      
      toast({
        title: "Failed to claim USDC",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsClaimingUSDC(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Main Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 card-glass hover:shadow-golden-glow transition-all duration-500 relative">
          {/* Premium Gold Lottie Animation - Floating Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <div className="relative group">
              {/* Clean transparent container */}
              <div className="relative group-hover:scale-105 transition-all duration-300">
                <PremiumGoldLottie 
                  width={140} 
                  height={140} 
                  className="" 
                />
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-8 left-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse delay-700"></div>
            </div>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-playfair golden-text">Portfolio Overview</CardTitle>
            <CardDescription className="text-gold-200/70 font-inter">Total value across all Monad DeFi categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-end">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-48 bg-charcoal-700 rounded-xl" />
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-3 text-gold-400" />
                    <span className="text-sm text-gold-300/60 font-inter">Fetching portfolio data...</span>
                  </div>
                </div>
              ) : !isConnected ? (
                <div className="space-y-3">
                  <h2 className="text-5xl font-playfair font-bold golden-text">$0.00</h2>
                  <div className="flex items-center text-gold-200/60">
                    <WalletIcon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-inter">Connect wallet to view your portfolio</span>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-5xl font-playfair font-bold golden-text">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
                  <div className={`ml-6 flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                    <span className="font-jetbrains font-medium text-lg">{isPositive ? '+' : ''}{portfolioChange}%</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {(isConnected ? portfolioData : []).map((item) => (
                <div key={item.name} className="space-y-4 group">
                  <div className="flex items-center justify-between">
                    <span className="font-inter font-medium text-gold-200 group-hover:text-gold-100 transition-colors duration-300">{item.name}</span>
                    <span className="font-jetbrains text-gold-300 group-hover:text-gold-200 transition-colors duration-300">{item.value}%</span>
                  </div>
                  
                  {/* Custom Enhanced Progress Bar */}
                  <div className="relative">
                    <div className="h-4 w-full bg-charcoal-700/60 rounded-full border-2 border-golden-border shadow-inner overflow-hidden">
                      <div 
                        className="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
                        style={{ 
                          width: `${item.value}%`,
                          background: `linear-gradient(135deg, ${item.color}, ${item.color}cc, ${item.color}99)`
                        }}
                      >
                        {/* Golden shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-200/20 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
                        
                        {/* Inner highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-full"></div>
                        
                        {/* End cap glow */}
                        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-gold-300/40 to-transparent"></div>
                      </div>
                    </div>
                    
                    {/* Outer golden glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-400/15 via-gold-500/20 to-gold-600/15 rounded-full blur-sm opacity-60 -z-10 group-hover:opacity-80 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
              
              {!isConnected && (
                <div className="col-span-2 flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-golden rounded-2xl flex items-center justify-center mx-auto shadow-golden-glow">
                      <WalletIcon className="h-8 w-8 text-charcoal-900" />
                    </div>
                    <p className="text-gold-200/70 font-inter text-lg">Connect your wallet to view your portfolio allocations</p>
                    <Button 
                      variant="outline" 
                      className="bg-charcoal-800/60 border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 font-inter px-6 py-3"
                      onClick={handleConnectWallet}
                    >
                      <WalletIcon className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-golden-border/30 pt-4">
            <div className="text-sm text-gold-300/60 font-jetbrains">
              Last updated: {format(lastUpdated, 'dd MMM yyyy, HH:mm')} UTC
            </div>
          </CardFooter>
        </Card>
        
        <Card className="card-glass hover:shadow-golden-glow transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-playfair golden-text">Portfolio Distribution</CardTitle>
            <CardDescription className="text-gold-200/70 font-inter">Allocation across DeFi categories</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-52 h-52 relative">
              <PieChart width={210} height={210}>
                <Pie
                  data={isConnected ? portfolioData : defaultPortfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(isConnected ? portfolioData : defaultPortfolioData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-gold-400" />
                ) : !isConnected ? (
                  <>
                    <WalletIcon className="h-7 w-7 text-gold-300/60" />
                    <span className="mt-2 font-jetbrains text-sm text-gold-300/60">Not Connected</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-7 w-7 text-gold-400" />
                    <span className="mt-1 font-roboto-mono text-sm">Total</span>
                    <span className="font-space font-bold">100%</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex flex-col space-y-4">
              {/* Portfolio Legend */}
              {isConnected ? (
                <ul className="w-full flex flex-wrap gap-2">
                  {portfolioData.map((item) => (
                    <li key={item.name} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs">{item.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="w-full text-center text-muted-foreground text-xs">
                  Connect your wallet to view your portfolio distribution
                </div>
              )}
              
              {/* GfVx5PnDyJ Lottie Animation */}
              <div className="flex justify-center">
                <GfVx5PnDyJLottie 
                  width={450} 
                  height={250} 
                  className="rounded-lg" 
                />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Token Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MON Balance Card */}
        <Card className="card-glass border-cosmic-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">MON Balance</CardTitle>
                  <CardDescription className="text-xs">Native Monad Testnet Token</CardDescription>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      MON
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Monad Testnet Native Token</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8">
                <WalletIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
              </div>
            ) : isMonBalanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32 bg-cosmic-800" />
                <Skeleton className="h-4 w-24 bg-cosmic-800" />
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Loading MON balance...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end space-x-2">
                  <h3 className="text-2xl font-bold font-space">
                    {monBalanceData ? parseFloat(formatEther(monBalanceData.value)).toFixed(4) : '0.0000'}
                  </h3>
                  <span className="text-sm text-muted-foreground mb-1">MON</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-roboto-mono">
                    ≈ ${monBalanceData ? (parseFloat(formatEther(monBalanceData.value)) * monPrice).toFixed(2) : '0.00'} USD
                  </div>
                  <div className="text-xs text-purple-400">
                    @ ${monPrice.toFixed(2)}
                  </div>
                </div>
                <div className="w-full bg-cosmic-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: monBalanceData ? `${Math.min((parseFloat(formatEther(monBalanceData.value)) / 100) * 100, 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* USDC Balance Card */}
        <Card className="card-glass border-cosmic-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-green-600">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">USDC Balance</CardTitle>
                  <CardDescription className="text-xs">USD Coin Stablecoin</CardDescription>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      USDC
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>USD Coin - Stablecoin pegged to $1</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8">
                <WalletIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
              </div>
            ) : isUsdcBalanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32 bg-cosmic-800" />
                <Skeleton className="h-4 w-24 bg-cosmic-800" />
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-green-400" />
                  <span className="text-xs text-muted-foreground">Loading USDC balance...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end space-x-2">
                  <h3 className="text-2xl font-bold font-space">
                    {usdcBalanceData ? parseFloat(formatUnits(usdcBalanceData.value, usdcBalanceData.decimals)).toFixed(2) : '0.00'}
                  </h3>
                  <span className="text-sm text-muted-foreground mb-1">USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-roboto-mono">
                    ≈ ${usdcBalanceData ? parseFloat(formatUnits(usdcBalanceData.value, usdcBalanceData.decimals)).toFixed(2) : '0.00'} USD
                  </div>
                  <div className="text-xs text-green-400">
                    @ $1.00
                  </div>
                </div>
                <div className="w-full bg-cosmic-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-600 h-2 rounded-full" 
                    style={{ 
                      width: usdcBalanceData ? `${Math.min((parseFloat(formatUnits(usdcBalanceData.value, usdcBalanceData.decimals)) / 1000) * 100, 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
                
                {/* Show faucet button if user has low or no USDC */}
                {(() => {
                  const usdcBalance = usdcBalanceData ? parseFloat(formatUnits(usdcBalanceData.value, usdcBalanceData.decimals)) : 0;
                  const showFaucetButton = usdcBalance < 100; // Show button if less than 100 USDC
                  
                  return showFaucetButton ? (
                    <div className="pt-3 border-t border-cosmic-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Need USDC for testing?</span>
                        <span className="text-xs text-green-400">Free Faucet</span>
                      </div>
                      <Button 
                        onClick={handleClaimUSDC}
                        disabled={isClaimingUSDC}
                        className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white"
                        size="sm"
                      >
                        {isClaimingUSDC ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Claiming USDC...
                          </>
                        ) : (
                          <>
                            <Coins className="mr-2 h-4 w-4" />
                            Claim 1,000 USDC
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Free USDC for Monad TestNet
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioOverview;
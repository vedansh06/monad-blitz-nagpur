import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, MoveVertical, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { fetchTokenPrices, cacheTokenData, getCachedTokenData, TokenPrice, fetchTokenInsights } from '@/lib/tokenService';
import { isGeminiAvailable } from '@/lib/geminiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  allocation: number;
  category: string;
}

const categoryColors: { [key: string]: string } = {
  meme: '#FFD700',     // Gold
  rwa: '#DAA520',      // Dark goldenrod
  bigcap: '#B8860B',   // Dark goldenrod
  defi: '#FFA500',     // Orange gold
  stablecoin: '#F4A460', // Sandy brown gold
  gaming: '#CD853F',   // Peru gold
  ai: '#D2691E',       // Chocolate gold
  social: '#DEB887',   // Burlywood
  infrastructure: '#BC8F8F', // Rosy brown
  all: '#FFD700'       // Gold
};

// Crystal Exchange tokens - based on live market data from Crystal Exchange
const mockTokens: Token[] = [
  // Core trading pairs (by volume)
  { id: '1', name: 'Monad', symbol: 'MON', price: 3.294, change24h: 0.27, marketCap: 329400000, volume: 715262.67, allocation: 20, category: 'l1' },  
  { id: '2', name: 'USD Coin', symbol: 'USDC', price: 1.00, change24h: 0.01, marketCap: 28500000000, volume: 3700000000, allocation: 18, category: 'stablecoin' },
  { id: '3', name: 'Tether USD', symbol: 'USDT', price: 0.993, change24h: -0.10, marketCap: 89300000000, volume: 51749.84, allocation: 15, category: 'stablecoin' },
  { id: '4', name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 115687, change24h: -1.52, marketCap: 22254530000, volume: 4681.11, allocation: 12, category: 'bigcap' },
  { id: '5', name: 'Wrapped Ethereum', symbol: 'WETH', price: 4954.9, change24h: 3.25, marketCap: 595588000000, volume: 1552.61, allocation: 12, category: 'bigcap' },
  { id: '6', name: 'Wrapped Solana', symbol: 'WSOL', price: 234.70, change24h: -0.04, marketCap: 110000000000, volume: 1372.02, allocation: 8, category: 'l1' },
  
  // MON-based pairs (by volume)
  { id: '7', name: 'PINGU Token', symbol: 'PINGU', price: 0.14159, change24h: 1.61, marketCap: 5663600, volume: 40053.34, allocation: 4, category: 'meme' },
  { id: '8', name: 'Staked Monad', symbol: 'sMON', price: 3.303, change24h: 0.00, marketCap: 66060000, volume: 20801.83, allocation: 4, category: 'defi' },
  { id: '9', name: 'APR Monad', symbol: 'aprMON', price: 3.337, change24h: 3.35, marketCap: 33370000, volume: 13821.94, allocation: 4, category: 'defi' },
  { id: '10', name: 'DAK Token', symbol: 'DAK', price: 2.169, change24h: 0.80, marketCap: 27251400, volume: 12564.60, allocation: 3, category: 'defi' },
  { id: '11', name: 'YAKI Token', symbol: 'YAKI', price: 0.01296, change24h: 1.31, marketCap: 1008480, volume: 7781.05, allocation: 2, category: 'meme' },
  { id: '12', name: 'CHOG Token', symbol: 'CHOG', price: 0.22456, change24h: -13.91, marketCap: 4938320, volume: 4518.27, allocation: 2, category: 'meme' },
  { id: '13', name: 'Shared Monad', symbol: 'shMON', price: 3.757, change24h: 3.65, marketCap: 10657960, volume: 2838.28, allocation: 2, category: 'defi' }
];

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVALS = {
  AUTO: 300000, // 5 minutes auto-refresh
  MANUAL: null  // Manual refresh only
};

const TokenTable = ({ category = "all" }: { category?: string }) => {
  const [sortField, setSortField] = useState<keyof Token>('allocation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTokenData, setLiveTokenData] = useState<TokenPrice[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(REFRESH_INTERVALS.AUTO);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenInsight, setTokenInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const { toast } = useToast();
  
  // Auto-refresh effect
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      refreshTokenData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    setRefreshInterval(newState ? REFRESH_INTERVALS.AUTO : REFRESH_INTERVALS.MANUAL);
    
    toast({
      title: newState ? 'Auto-refresh enabled' : 'Auto-refresh disabled',
      description: newState 
        ? 'Prices will update every 5 minutes' 
        : 'Prices will only update when you click refresh',
    });
  };
  
  // Fetch token prices on component mount
  useEffect(() => {
    const loadTokenData = async () => {
      // Check if we have cached data that's less than 5 minutes old
      const { data: cachedData, timestamp } = getCachedTokenData();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      if (cachedData.length > 0) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
        
        // Only fetch new data if cached data is older than 5 minutes
        if (timestamp < fiveMinutesAgo) {
          await refreshTokenData(false); // Silent refresh
        }
        return;
      }
      
      // Otherwise fetch fresh data
      await refreshTokenData(false); // Silent refresh
    };
    
    loadTokenData();
  }, []);
  
  // Check if Gemini API is available
  useEffect(() => {
    setIsGeminiEnabled(typeof isGeminiAvailable === 'function' ? isGeminiAvailable() : false);
  }, []);

  // Function to fetch token insights
  const getTokenInsights = async (token: Token) => {
    if (!isGeminiEnabled) {
      toast({
        title: "AI Insights Unavailable",
        description: "Gemini API key is not configured. Please add it to your environment variables.",
        variant: "destructive"
      });
      return;
    }
    setSelectedToken(token);
    setTokenInsight(null);
    setIsInsightLoading(true);
    try {
      const insights = await fetchTokenInsights(token.symbol);
      setTokenInsight(insights);
      
      // Check if the response indicates API key issues
      if (insights.includes('API key expired') || insights.includes('API_KEY_INVALID')) {
        toast({
          title: "AI Service Notice",
          description: "The AI analysis service needs configuration updates. Showing general insights instead.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching token insights:', error);
      
      // Check for API key errors
      if (error instanceof Error && (
        error.message.includes('API key expired') || 
        error.message.includes('API_KEY_INVALID') ||
        error.message.includes('401') ||
        error.message.includes('403')
      )) {
        toast({
          title: "AI Service Configuration",
          description: "AI insights are temporarily unavailable. Please check API configuration.",
          variant: "default"
        });
        
        // Still show fallback content
        setTokenInsight(`# ${token.symbol} Token Information

## Service Notice
AI insights are temporarily unavailable due to API configuration. Here's general information:

## Token Details
• **Symbol**: ${token.symbol}
• **Name**: ${token.name || 'Token name unavailable'}
• **Network**: Monad Blockchain Ecosystem

## General Investment Guidelines
• **Research**: Always verify project fundamentals
• **Risk**: Cryptocurrency investments are highly volatile
• **Due Diligence**: Check official documentation and community

*Please contact support for AI service restoration.*`);
      } else {
        toast({
          title: "Failed to Load Insights",
          description: error instanceof Error ? error.message : "Could not fetch AI insights for this token. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsInsightLoading(false);
    }
  };

  // Function to refresh token data manually
  const refreshTokenData = async (showToast = true) => {
    setIsLoading(true);
    try {
      const data = await fetchTokenPrices();
      if (data.length > 0) {
        setLiveTokenData(data);
        cacheTokenData(data);
        setLastUpdated(new Date());
        
        if (showToast) {
          toast({
            title: 'Token prices updated',
            description: 'Latest market data has been loaded successfully.',
          });
        }
      }
    } catch (error: any) {
      console.error('Error refreshing token data:', error);
      
      // Handle rate limiting specifically
      if (error.response && error.response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment before refreshing again.',
          variant: 'destructive',
        });
      } else if (showToast) {
        toast({
          title: 'Update failed',
          description: 'Could not refresh token prices. Please try again later.',
          variant: 'destructive',
        });
      }
      
      // If fetch fails but we have cached data, keep using it
      const { data: cachedData, timestamp } = getCachedTokenData();
      if (cachedData.length > 0 && !liveTokenData.length) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Merge live token data with mock data
  const mergedTokenData = () => {
    if (liveTokenData.length === 0) return mockTokens;
    
    // Create a map of symbols to live data
    const liveDataMap = new Map(liveTokenData.map(token => [
      token.symbol.toUpperCase(),
      token
    ]));
    
    // Update mock tokens with live data where available
    return mockTokens.map(token => {
      const liveToken = liveDataMap.get(token.symbol.toUpperCase());
      if (liveToken) {
        return {
          ...token,
          price: liveToken.current_price,
          change24h: liveToken.price_change_percentage_24h,
          marketCap: liveToken.market_cap,
          volume: liveToken.total_volume
        };
      }
      return token;
    });
  };
  
  // Filter tokens based on category
  const filteredTokens = useMemo(() => {
    return category === 'all' 
      ? mergedTokenData() 
      : mergedTokenData().filter(token => {
          const tokenCategories = token.category.split('/');
          return tokenCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
        });
  }, [category, liveTokenData]);
  
  // Sort tokens based on current sort field and direction
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [filteredTokens, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTokens.length / ITEMS_PER_PAGE);
  const paginatedTokens = sortedTokens.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof Token) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const getCategoryTitle = () => {
    switch(category) {
      case 'ai': return 'AI & DeFi Tokens';
      case 'meme': return 'Meme & NFT Tokens';
      case 'rwa': return 'Real World Assets';
      case 'bigcap': return 'Big Cap Tokens';
      case 'defi': return 'DeFi Protocols';
      case 'l1': return 'Layer 1 Protocols';
      case 'stablecoin': return 'Stablecoins';
      default: return 'All Tokens';
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };
  
    // Format the last updated time
    const getLastUpdatedText = () => {
      if (!lastUpdated) return 'Never updated';
      
      // If updated less than a minute ago, show "Just now"
      const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secondsAgo < 60) return 'Just now';
      
      // If updated less than an hour ago, show minutes
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
      
      // Otherwise show the time
      return lastUpdated.toLocaleTimeString();
    };
    
    return (
      <>
        <Card className="card-glass hover:shadow-golden-glow transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between border-b border-golden-border/30 pb-6">
            <div>
              <CardTitle className="text-3xl font-playfair golden-text">{getCategoryTitle()}</CardTitle>
              {isGeminiEnabled && (
                <p className="text-sm text-gold-200/60 mt-2 font-inter">
                  Advanced AI analytics with real-time liquidity data powered by Crystal Exchange on Monad Network
                </p>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-gold-300/70 bg-charcoal-800/40 px-3 py-2 rounded-lg border border-golden-border/20">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-jetbrains">{getLastUpdatedText()}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-charcoal-800 border-golden-border text-gold-200">
                      <p>Last updated: {lastUpdated?.toLocaleString() || 'Never'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gold-200 font-inter">Auto Refresh</span>
                <Switch 
                  checked={autoRefreshEnabled} 
                  onCheckedChange={toggleAutoRefresh} 
                  aria-label="Toggle auto-refresh"
                  className="data-[state=checked]:bg-gradient-golden"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshTokenData(true)} 
                disabled={isLoading}
                className="bg-charcoal-800/60 border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 font-inter"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden border border-golden-border/20">
              <Table>
                <TableHeader className="bg-charcoal-800/40">
                  <TableRow className="border-golden-border/20 hover:bg-charcoal-700/30">
                    <TableHead className="w-[180px] text-gold-200 font-inter font-semibold py-4">Token</TableHead>
                    <TableHead className="text-right text-gold-200 font-inter font-semibold">Price</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-inter font-semibold p-0 text-gold-200 hover:text-gold-100 hover:bg-transparent" 
                        onClick={() => handleSort('change24h')}
                        aria-sort={sortField === 'change24h' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        24h Change 
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                    <TableHead className="text-right">Volume (24h)</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-medium p-0" 
                        onClick={() => handleSort('allocation')}
                        aria-sort={sortField === 'allocation' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        Allocation
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
  
                <TableBody>
                  {paginatedTokens.map((token) => (
                    <TableRow 
                      key={token.id} 
                      className="cursor-pointer hover:bg-white/5"
                      onClick={() => getTokenInsights(token)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center">
                            <span className="font-medium text-xs">{token.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground font-roboto-mono">{token.symbol}</span>
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: `${categoryColors[token.category]}20`,
                                  color: categoryColors[token.category]
                                }}
                              >
                                {token.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change24h > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          <span className="font-roboto-mono">{token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.marketCap)}
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.volume)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-gradient-button">{token.allocation}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {paginatedTokens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tokens found for this category
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
  
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Previous
                          </PaginationLink>
                        ) : (
                          <PaginationPrevious onClick={goToPreviousPage} />
                        )}
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 py-2">
                          Page {currentPage} of {totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        {currentPage === totalPages ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Next
                          </PaginationLink>
                        ) : (
                          <PaginationNext onClick={goToNextPage} />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Token Insights Dialog */}
        <Dialog open={!!selectedToken} onOpenChange={(open) => !open && setSelectedToken(null)}>
          <DialogContent className="sm:max-w-[600px] bg-cosmic-900 border-cosmic-700">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedToken && (
                  <>
                    <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center mr-2">
                      <span className="font-medium text-xs">{selectedToken.symbol.substring(0, 2)}</span>
                    </div>
                    {selectedToken.name} ({selectedToken.symbol}) Insights
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 px-2">
              {isInsightLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mb-4 text-nebula-400" />
                  <p className="text-muted-foreground">Generating AI insights...</p>
                </div>
              ) : tokenInsight ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{tokenInsight}</div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No insights available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };
  
  export default TokenTable;
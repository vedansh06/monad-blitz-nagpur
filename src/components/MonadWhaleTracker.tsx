import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Activity,
  TrendingUp,
  Database
} from 'lucide-react';
import { 
  getWhaleTransactions,
  getMockWhaleTransactions,
  WhaleTransaction,
  formatMonValue,
  formatUSDValue,
  getCurrentMonPrice,
  getWhaleSize,
  getWhaleSizeEmoji,
  getWhaleSizeColor
} from '@/lib/monadApiService';

interface MonadWhaleTrackerProps {
  className?: string;
}

export function MonadWhaleTracker({ className = '' }: MonadWhaleTrackerProps) {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMonadAPI, setIsUsingMonadAPI] = useState(false);
  const [currentMonPrice, setCurrentMonPrice] = useState(3.294);
  const [totalVolumeUSD, setTotalVolumeUSD] = useState(0);
  const [whaleStats, setWhaleStats] = useState({
    totalTransactions: 0,
    largestTransaction: 0,
    uniqueWhales: 0
  });

  const fetchWhaleData = async () => {
    setError(null);
    
    try {
      // Get current MON price
      const price = await getCurrentMonPrice();
      setCurrentMonPrice(price);
      
      // Fetch whale transactions (includes automatic fallback to mock data)
      const whaleData = await getWhaleTransactions(10000, 20); // Min $10K USD, limit 20
      
      // Determine data source based on API key and results
      const hasApiKey = !!import.meta.env.VITE_MONAD_API_KEY;
      const hasRealData = whaleData.length > 0 && hasApiKey;
      setIsUsingMonadAPI(hasRealData);
      
      // Calculate statistics
      const totalVolume = whaleData.reduce((sum, tx) => sum + tx.valueUSD, 0);
      const largestTx = whaleData.length > 0 ? Math.max(...whaleData.map(tx => tx.valueUSD)) : 0;
      const uniqueAddresses = new Set([...whaleData.map(tx => tx.from), ...whaleData.map(tx => tx.to)]);
      
      setTotalVolumeUSD(totalVolume);
      setWhaleStats({
        totalTransactions: whaleData.length,
        largestTransaction: largestTx,
        uniqueWhales: uniqueAddresses.size
      });
      
      setTransactions(whaleData);
      
      if (!hasApiKey) {
        setError('⚠️ Demo Mode: Add VITE_MONAD_API_KEY to .env for live data');
      }
    } catch (error) {
      console.error('Error fetching whale data:', error);
      setError('Failed to fetch whale transaction data. Using demo data.');
      
      // Fallback to mock data on any error
      const mockData = getMockWhaleTransactions();
      setTransactions(mockData);
      setIsUsingMonadAPI(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Visual feedback
    await fetchWhaleData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchWhaleData().finally(() => setIsLoading(false));
  }, []);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sell': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'transfer': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contract': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'internal': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (hash: string) => {
    return `https://testnet.monadexplorer.com/tx/${hash}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={`card-glass ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monad Whale Tracker
          </CardTitle>
          <CardDescription>Loading whale transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-glass ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monad Whale Tracker
              <Badge variant="outline" className={`ml-2 text-xs ${isUsingMonadAPI 
                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
                <Database className="h-3 w-3 mr-1" />
                {isUsingMonadAPI ? 'Live API' : 'Demo'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-purple-200/60">
              {isUsingMonadAPI ? 'Real-time Monad blockchain data' : 'Enhanced demo data with realistic patterns'} • MON Price: ${currentMonPrice.toFixed(3)}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        {/* Statistics Summary */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-300">{whaleStats.totalTransactions}</div>
              <div className="text-sm text-purple-200/60">Total Transactions</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-300">{formatUSDValue(totalVolumeUSD)}</div>
              <div className="text-sm text-blue-200/60">Total Volume</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-300">{formatUSDValue(whaleStats.largestTransaction)}</div>
              <div className="text-sm text-yellow-200/60">Largest Transaction</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-300">{whaleStats.uniqueWhales}</div>
              <div className="text-sm text-green-200/60">Unique Addresses</div>
            </div>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No whale transactions found.</p>
            <p className="text-sm mt-1">Large MON movements will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-cosmic-800">
                    <TableHead className="text-purple-300">Size</TableHead>
                    <TableHead className="text-purple-300">Type</TableHead>
                    <TableHead className="text-purple-300">From</TableHead>
                    <TableHead className="text-purple-300">To</TableHead>
                    <TableHead className="text-purple-300">Value (MON)</TableHead>
                    <TableHead className="text-purple-300">USD Value</TableHead>
                    <TableHead className="text-purple-300">Age</TableHead>
                    <TableHead className="text-purple-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => {
                    const whaleSize = getWhaleSize(tx.valueUSD);
                    const whaleSizeColor = getWhaleSizeColor(whaleSize);
                    const whaleSizeEmoji = getWhaleSizeEmoji(whaleSize);
                    
                    return (
                      <TableRow key={tx.hash || index} className="border-cosmic-800/50 hover:bg-purple-500/5">
                        <TableCell>
                          <Badge className={`${whaleSizeColor} border text-xs`}>
                            {whaleSizeEmoji} {whaleSize}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTransactionTypeColor(tx.type || 'transfer')} border`}>
                            {tx.type || 'transfer'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-cosmic-300">
                          {formatAddress(tx.from)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-cosmic-300">
                          {formatAddress(tx.to)}
                        </TableCell>
                        <TableCell className="font-semibold text-purple-200">
                          {formatMonValue(tx.value)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-400">
                          {formatUSDValue(tx.valueUSD)}
                        </TableCell>
                        <TableCell className="text-cosmic-400 text-sm">
                          {getTimeAgo(tx.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                            className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {!isUsingMonadAPI && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-300 text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Currently showing enhanced demo data with real MON pricing ($3.294). Connect to Monad API for live whale tracking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
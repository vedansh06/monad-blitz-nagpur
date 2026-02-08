// src/components/CoreWhaleTracker.tsx
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
  formatCoreValue,
  formatUSDValue
} from '@/lib/monadApiService';

interface CoreWhaleTrackerProps {
  className?: string;
}

export function CoreWhaleTracker({ className = '' }: CoreWhaleTrackerProps) {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCoreAPI, setIsUsingCoreAPI] = useState(false);

  const fetchWhaleData = async () => {
    setError(null);
    
    try {
      // Try Core API first, fallback to mock data
      let whaleData: WhaleTransaction[] = [];
      
      try {
        whaleData = await getWhaleTransactions(50000, 15); // Min $50K USD, limit 15
        setIsUsingCoreAPI(true);
        
        if (whaleData.length === 0) {
          whaleData = getMockWhaleTransactions();
          setIsUsingCoreAPI(false);
        }
      } catch (apiError) {
        console.log('Core API not available, using mock data:', apiError);
        whaleData = getMockWhaleTransactions();
        setIsUsingCoreAPI(false);
      }
      
      setTransactions(whaleData);
    } catch (error) {
      console.error('Error fetching whale data:', error);
      setError('Failed to fetch whale transaction data');
      setTransactions([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchWhaleData();
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWhaleData();
    setIsRefreshing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internal':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'transfer':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'contract':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      internal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      transfer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      contract: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <Badge className={variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Whale Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading whale transactions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Whale Tracker
                {!isUsingCoreAPI && (
                  <Badge variant="outline" className="ml-2">
                    Demo Mode
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Large value transactions on Monad Blockchain
                {isUsingCoreAPI ? ' (Live Data)' : ' (Demo Data)'}
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transactions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Whale Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatUSDValue(totalVolume)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Volume
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {transactions.length > 0 ? formatUSDValue(Math.max(...transactions.map(tx => tx.valueUSD))) : '$0'}
              </div>
              <div className="text-sm text-muted-foreground">
                Largest Transaction
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Whale Transactions</CardTitle>
          <CardDescription>
            Transactions with value ≥ $50,000 USD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No whale transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value (CORE)</TableHead>
                    <TableHead>Value (USD)</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => (
                    <TableRow key={`${tx.hash}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          {getTypeBadge(tx.type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {truncateAddress(tx.hash)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {truncateAddress(tx.from)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {truncateAddress(tx.to)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCoreValue(tx.value)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatUSDValue(tx.valueUSD)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTimestamp(tx.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`https://scan.test2.btcs.network/tx/${tx.hash}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Source Info */}
      {!isUsingCoreAPI && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Database className="h-4 w-4" />
              <span className="text-sm">
                Currently showing demo data. Connect to Core API for live whale tracking.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

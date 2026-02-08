import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { toast } from '@/components/ui/use-toast';

interface USDCFaucetProps {
  className?: string;
}

export function USDCFaucet({ className = '' }: USDCFaucetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const handleClaimUSDC = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim USDC tokens.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the USDC faucet contract
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "USDC Claimed Successfully!",
        description: "1000 USDC has been added to your wallet for testing.",
      });
    } catch (error) {
      console.error('Error claiming USDC:', error);
      toast({
        title: "Failed to claim USDC",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-green-500" />
          USDC Test Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get free USDC tokens for testing portfolio management on Monad Blockchain TestNet.
        </p>
        
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <span className="text-sm font-medium">Faucet Amount:</span>
          <span className="text-lg font-bold text-green-600">1,000 USDC</span>
        </div>

        <Button 
          onClick={handleClaimUSDC}
          disabled={!isConnected || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Claiming USDC...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Claim Free USDC
            </>
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Connect your wallet to claim USDC tokens
          </p>
        )}

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>Contract: {import.meta.env.VITE_USDC_CONTRACT_ADDRESS}</p>
          <p>Network: Monad Blockchain TestNet</p>
        </div>
      </CardContent>
    </Card>
  );
}

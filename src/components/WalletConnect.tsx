// src/components/WalletConnect.tsx
import { useAccount } from 'wagmi'
import { modal, useDisconnect } from '@/lib/appkit'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2, Wallet, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleConnect = () => {
    try {
      console.log('Opening wallet modal');
      if (modal) {
        modal.open();
      } else {
        console.error('Wallet modal is not available');
        toast.error('Connection Error', {
          description: 'Wallet connection is not available.'
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection Error', {
        description: 'Failed to connect wallet. Please try again.'
      });
    }
  };

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    
    setIsDisconnecting(true);
    setIsDropdownOpen(false);
    
    try {
      console.log("Disconnecting wallet...");
      await disconnect();
      toast.success("Disconnected", {
        description: "Your wallet has been disconnected successfully."
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Disconnect Error', {
        description: 'Failed to disconnect wallet.'
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address Copied", {
        description: "Your wallet address has been copied to clipboard."
      });
      setIsDropdownOpen(false);
    }
  };
  
  const getExplorerUrl = (address: string) => {
    return `https://testnet.monadexplorer.com/address/${address}`;
  };

  if (isConnected) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-charcoal-800/60 border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 h-9 md:h-11 px-2 md:px-6 py-2 md:py-3">
            <span className="px-1 md:px-2 py-0.5 rounded-md md:rounded-lg bg-purple-600 text-white mr-1 md:mr-2 text-xs md:text-sm font-medium">MON</span>
            <span className="font-roboto-mono text-xs md:text-sm">{formatAddress(address || '')}</span>
            <ChevronDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <span className="mr-2">📋</span>
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <a 
              href={getExplorerUrl(address || '')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center w-full"
            >
              <span className="mr-2">🔍</span>
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            className="cursor-pointer text-destructive"
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <span className="mr-2">🔌</span>
                Disconnect
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <Button 
      className="bg-gradient-golden hover:bg-gradient-golden-dark font-medium h-9 md:h-11 px-3 md:px-6 text-xs md:text-sm text-charcoal-900 hover:text-charcoal-900 border border-gold-400 hover:border-gold-300 shadow-md hover:shadow-golden-glow transition-all duration-300 hover:scale-105"
      onClick={handleConnect}
    >
      <Wallet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  )
}

export default WalletConnect;
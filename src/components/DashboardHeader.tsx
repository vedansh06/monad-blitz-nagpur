import { Droplets, Plus, Bot, Menu, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/WalletConnect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { monadTestnet } from "@/lib/chains";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import AIDocumentation from "@/components/AIDocumentation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const [showAIDocumentation, setShowAIDocumentation] = useState(false);
  const navigate = useNavigate();

  const handleFaucetClick = () => {
    const faucetUrl =
      import.meta.env.VITE_MONAD_FAUCET_URL || "https://faucet.monad.xyz/";
    window.open(faucetUrl, "_blank");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleAddNetwork = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask Not Found", {
        description: "Please install MetaMask to add the Monad Testnet.",
      });
      return;
    }

    try {
      // Convert chainId to hex format (required by MetaMask)
      const chainIdHex = `0x${monadTestnet.id.toString(16)}`;

      // First, try to switch to the network if it already exists
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
        toast.success("Network Switched", {
          description: "Successfully switched to Monad Blockchain TestNet.",
        });
        return;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log("Network not found, attempting to add it...");
        } else {
          // For other errors, just try to add the network
          console.log("Error switching network:", switchError);
        }
      }

      // Prepare the network params
      const networkParams = {
        chainId: chainIdHex,
        chainName: monadTestnet.name,
        nativeCurrency: {
          ...monadTestnet.nativeCurrency,
        },
        rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
        blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
      };

      console.log("Adding network with params:", networkParams);

      // Add the network to MetaMask
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networkParams],
      });

      toast.success("Network Added", {
        description: "Monad Testnet has been added to your wallet.",
      });
    } catch (error: any) {
      console.error("Error adding network:", error);

      // Check for specific error about symbol mismatch
      if (
        error.message &&
        error.message.includes("nativeCurrency.symbol does not match")
      ) {
        toast.info("Network Already Added", {
          description:
            "The Monad Testnet is already in your wallet. Please switch to it manually.",
        });
      } else {
        toast.error(
          "Failed to Add Network",
          error.message || "Please try adding the network manually.",
        );
      }
    }
  };

  return (
    <>
      {/* Golden Header Bar */}
      <div className="relative z-20 bg-charcoal-900/80 backdrop-blur-xl border-b border-golden-border shadow-charcoal-deep">
        {/* Golden accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-golden"></div>

        <div className="flex items-center justify-between py-3 md:py-6 px-4 md:px-8">
          {/* Logo Section */}
          <div
            className="flex items-center space-x-2 md:space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={handleLogoClick}
            title="Return to landing page">
            <div className="relative">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-golden flex items-center justify-center shadow-golden-glow animate-golden-pulse">
                <Crown className="h-5 w-5 md:h-7 md:w-7 text-charcoal-900" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-gold-400 rounded-full flex items-center justify-center">
                <Zap className="h-1.5 w-1.5 md:h-2 md:w-2 text-charcoal-900" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-playfair font-bold golden-text">
                MonoFi-AI
              </h1>
              <p className="text-xs font-inter text-gold-300/60 mt-0.5 md:mt-1 hidden sm:block">
                AI-powered DeFi navigator for Monad
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {/* AI Documentation Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 font-inter"
                    onClick={() => setShowAIDocumentation(true)}>
                    <Bot className="h-4 w-4 mr-2" />
                    AI Docs
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-charcoal-800 border-golden-border text-gold-200">
                  <p>Learn about our AI capabilities</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Add Network Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 font-inter"
                    onClick={handleAddNetwork}>
                    <Plus className="h-4 w-4 mr-2" />
                    Network
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-charcoal-800 border-golden-border text-gold-200">
                  <p>Add Monad Testnet to MetaMask</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Faucet Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 hover:shadow-golden-glow hover:scale-105 font-inter"
                    onClick={handleFaucetClick}>
                    <Droplets className="h-4 w-4 mr-2" />
                    Faucet
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-charcoal-800 border-golden-border text-gold-200">
                  <p>Get testnet tokens for development</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Wallet Connect button */}
            <div className="ml-4">
              <WalletConnect />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Wallet Connect button always visible */}
            <div>
              <WalletConnect />
            </div>

            {/* Mobile hamburger menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 bg-charcoal-800/60 backdrop-blur-xl border border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300"
                  aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-charcoal-900/95 backdrop-blur-xl border-golden-border">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 font-inter justify-start"
                    onClick={() => setShowAIDocumentation(true)}>
                    <Bot className="h-4 w-4 mr-2" />
                    AI Documentation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 font-inter justify-start"
                    onClick={handleAddNetwork}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Network
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-charcoal-800/60 backdrop-blur-xl border-golden-border hover:bg-gradient-golden hover:text-charcoal-900 text-gold-200 transition-all duration-300 font-inter justify-start"
                    onClick={handleFaucetClick}>
                    <Droplets className="h-4 w-4 mr-2" />
                    Get Faucet Tokens
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* AI Documentation Modal */}
      <Dialog open={showAIDocumentation} onOpenChange={setShowAIDocumentation}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 md:p-6 bg-charcoal-900/95 backdrop-blur-xl border-golden-border">
          <VisuallyHidden>
            <DialogTitle>AI System Documentation</DialogTitle>
          </VisuallyHidden>
          <div className="text-sm md:text-base leading-relaxed">
            <AIDocumentation />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;

// src/components/AllocationAdjuster.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useBlockchain } from '@/contexts/BlockchainContext';
import GfVx5PnDyJLottie from '@/components/GfVx5PnDyJLottie';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AllocationAdjuster = () => {
  const { 
    allocations, 
    pendingAllocations, 
    setPendingAllocations, 
    applyAllocations, 
    isUpdatingAllocations,
    refreshAllocations 
  } = useBlockchain();
  
  const { toast } = useToast();
  
  const [localAllocations, setLocalAllocations] = useState<any[]>([]);
  const [total, setTotal] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize local state from blockchain context
  useEffect(() => {
    if (pendingAllocations) {
      setLocalAllocations(pendingAllocations);
    } else {
      setLocalAllocations(allocations);
    }
    
    // Calculate total
    const newTotal = (pendingAllocations || allocations).reduce((sum, item) => sum + item.allocation, 0);
    setTotal(newTotal);
    
    // Reset hasChanges when allocations are updated from outside
    setHasChanges(false);
  }, [allocations, pendingAllocations]);
  
  // Refresh allocations on mount
  useEffect(() => {
    refreshAllocations();
  }, [refreshAllocations]);
  
  const handleSliderChange = (id: string, value: number) => {
    const updated = localAllocations.map(item => 
      item.id === id ? { ...item, allocation: value } : item
    );
    
    setLocalAllocations(updated);
    setHasChanges(true);
    
    // Recalculate total
    const newTotal = updated.reduce((sum, item) => sum + item.allocation, 0);
    setTotal(newTotal);
  };
  
  const handleApplyChanges = async () => {
    if (total !== 100) {
      toast({
        title: "Invalid Allocation",
        description: `Total allocation must be 100%. Current total: ${total}%`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update pending allocations in the blockchain context
      setPendingAllocations(localAllocations);
      
      // Apply the changes to the blockchain
      const success = await applyAllocations();
      
      if (success) {
        toast({
          title: "Allocations Updated",
          description: "Your portfolio has been rebalanced successfully!"
        });
        
        // Reset changes flag
        setHasChanges(false);
        
        // Refresh allocations from contract to ensure UI is in sync
        setTimeout(() => {
          refreshAllocations();
        }, 1000);
      }
    } catch (error) {
      console.error('Error applying allocations:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update allocations. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleReset = () => {
    // Reset to original allocations
    setLocalAllocations(allocations);
    setTotal(allocations.reduce((sum, item) => sum + item.allocation, 0));
    setHasChanges(false);
  };
  
  return (
    <Card className="card-glass">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4">
          <GfVx5PnDyJLottie 
            width={100} 
            height={100} 
            className="animate-bounce-slow"
          />
        </div>
        <CardTitle className="text-2xl pr-28">Portfolio Allocation</CardTitle>
        <CardDescription>Adjust your portfolio allocation across different asset categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {localAllocations.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.name}</span>
              <span className="font-roboto-mono">{item.allocation}%</span>
            </div>
            <Slider
              value={[item.allocation]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleSliderChange(item.id, value[0])}
              className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-nebula-600 [&>span:first-child]:to-nebula-400"
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-cosmic-700">
          <span className="font-medium">Total Allocation</span>
          <span className={`font-roboto-mono font-bold ${total !== 100 ? 'text-red-500' : 'text-green-500'}`}>
            {total}%
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isUpdatingAllocations}>
          Reset
        </Button>
        <Button 
          className="bg-gradient-golden hover:bg-gradient-golden-dark text-charcoal-900 hover:text-charcoal-900 font-medium border border-gold-400 hover:border-gold-300 shadow-md hover:shadow-golden-glow transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleApplyChanges} 
          disabled={!hasChanges || total !== 100 || isUpdatingAllocations}
        >
          {isUpdatingAllocations ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Apply Changes'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AllocationAdjuster;
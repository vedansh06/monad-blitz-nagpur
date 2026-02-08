// src/components/RainbowCatRemix.tsx
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface RainbowCatRemixProps {
  width?: number;
  height?: number;
  className?: string;
}

const RainbowCatRemix: React.FC<RainbowCatRemixProps> = ({ 
  width = 60, 
  height = 60, 
  className = '' 
}) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/rainbow cat remix.json');
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error('Error loading Rainbow Cat Remix animation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load animation');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  if (isLoading) {
    return (
      <div 
        style={{ width, height }} 
        className={`flex items-center justify-center ${className}`}
      >
        <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !animationData) {
    return (
      <div 
        style={{ width, height }} 
        className={`flex items-center justify-center text-gold-400/50 ${className}`}
      >
        <span className="text-xs">🌈</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Lottie
        animationData={animationData}
        style={{ width, height }}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

export default RainbowCatRemix;

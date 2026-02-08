import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface GfVx5PnDyJLottieProps {
  width?: number;
  height?: number;
  className?: string;
}

const GfVx5PnDyJLottie = ({ width = 200, height = 200, className = '' }: GfVx5PnDyJLottieProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/GfVx5PnDyJ.json');
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
        } else {
          console.warn('Failed to load GfVx5PnDyJ animation data');
        }
      } catch (error) {
        console.error('Error loading GfVx5PnDyJ animation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-gold-50/5 to-gold-100/5 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gold-400/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!animationData) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-gray-50/5 to-gray-100/5 rounded-lg border border-gray-400/10 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-400/20 rounded-full mx-auto mb-2"></div>
          <span className="text-xs text-gray-400">Animation</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default GfVx5PnDyJLottie;
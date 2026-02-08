import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface PremiumGoldLottieProps {
  width?: number;
  height?: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const PremiumGoldLottie: React.FC<PremiumGoldLottieProps> = ({
  width = 120,
  height = 120,
  className = '',
  loop = true,
  autoplay = true
}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation data
    fetch('/Premium Gold.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

  if (!animationData) {
    // Show a loading placeholder or fallback
    return (
      <div className={`flex justify-center items-center ${className}`} style={{ width, height }}>
        <div className="animate-pulse bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{
          width: width,
          height: height,
        }}
      />
    </div>
  );
};

export default PremiumGoldLottie;

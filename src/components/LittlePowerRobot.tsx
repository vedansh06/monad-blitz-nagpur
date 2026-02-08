import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LittlePowerRobotProps {
  width?: number;
  height?: number;
  className?: string;
}

const LittlePowerRobot = ({ width = 60, height = 60, className = '' }: LittlePowerRobotProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/Little power robot.json');
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
        } else {
          console.warn('Failed to load little power robot animation data');
        }
      } catch (error) {
        console.error('Error loading little power robot animation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50/5 to-purple-100/5 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse">
          <div className="w-6 h-6 bg-blue-400/20 rounded-full"></div>
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
          <div className="w-6 h-6 bg-gray-400/20 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Robot</span>
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

export default LittlePowerRobot;

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface WorkplaceLottieProps {
  width?: number;
  height?: number;
  className?: string;
}

const WorkplaceLottie = ({ width = 200, height = 200, className = '' }: WorkplaceLottieProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/Man and robot with computers sitting together in workplace.json');
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
        } else {
          console.warn('Failed to load workplace animation data');
        }
      } catch (error) {
        console.error('Error loading workplace animation:', error);
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
          <div className="w-8 h-8 bg-blue-400/20 rounded-full"></div>
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
          <span className="text-xs text-gray-400">Workplace</span>
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

export default WorkplaceLottie;

import { useEffect, useState } from 'react';

const LoadingAnimation = () => {
  const [dots, setDots] = useState('');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1.5) % 360);
    }, 16); // ~60fps

    return () => {
      clearInterval(dotsInterval);
      clearInterval(rotationInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col items-center justify-center">
      {/* Modern Pizza Animation */}
      <div className="relative w-48 h-48 mb-8">
        {/* Glowing background circle */}
        <div className="absolute inset-0 rounded-full bg-pink-100 blur-md opacity-60" />
        
        {/* Modern pizza icon */}
        <div 
          className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
          style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Pizza base */}
            <circle cx="50" cy="50" r="45" fill="#F97316" className="opacity-90" />
            
            {/* Modern toppings pattern */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const cx = 50 + 30 * Math.cos(angle);
              const cy = 50 + 30 * Math.sin(angle);
              return (
                <circle 
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i % 2 === 0 ? 5 : 4}
                  fill={i % 2 === 0 ? "#F59E0B" : "#EF4444"}
                  className="transition-all duration-500"
                />
              );
            })}
            
            {/* Slice lines */}
            {[0, 120, 240].map((angle, i) => (
              <line 
                key={i}
                x1="50" y1="50"
                x2={50 + 45 * Math.cos(angle * Math.PI / 180)}
                y2={50 + 45 * Math.sin(angle * Math.PI / 180)}
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            ))}
          </svg>
        </div>
        
        {/* Floating slice */}
        <div 
          className="absolute w-10 h-10 transition-all duration-300"
          style={{
            left: `${50 + 25 * Math.cos((rotation * 2 * Math.PI) / 180)}%`,
            top: `${50 + 25 * Math.sin((rotation * 2 * Math.PI) / 180)}%`,
            transform: `translate(-50%, -50%) rotate(${rotation * 1.5}deg)`,
            opacity: 0.9
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path 
              d="M50 50 L95 30 L50 5 Z" 
              fill="#F97316" 
              stroke="white" 
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <circle cx="70" cy="25" r="3" fill="#F59E0B" />
            <circle cx="60" cy="40" r="2.5" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        {/* <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 animate-pulse">
          Welcome Back....
        </h2> */}
        <p className="text-lg text-gray-600 font-medium">
          Just a moment{dots}
        </p>
      </div>
      
      {/* Modern decorative dots */}
      <div className="flex space-x-2 mt-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400"
            style={{
              opacity: dots.length >= i ? 1 : 0.3,
              transform: dots.length >= i ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;

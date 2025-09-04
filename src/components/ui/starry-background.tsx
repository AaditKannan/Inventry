import React from 'react';

interface StarryBackgroundProps {
  className?: string;
  starCount?: number;
  children?: React.ReactNode;
}

export function StarryBackground({ 
  className = "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", 
  starCount = 25,
  children 
}: StarryBackgroundProps) {
  // Create deterministic star positions to avoid hydration mismatch
  const stars = React.useMemo(() => {
    return [...Array(starCount)].map((_, i) => {
      // Use index to create deterministic but varied positions
      const seed = i * 137.508; // Golden angle approximation for good distribution
      return {
        left: ((seed * 7) % 100),
        top: ((seed * 11) % 100),
        delay: (i * 0.2) % 3,
        duration: 2 + (i % 3)
      };
    });
  }, [starCount]);

  return (
    <div className={`${className} relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 150px 150px'
        }} />
      </div>

      {/* Twinkling stars - the cool animated dots */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-80 animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10 rounded-lg rotate-45 animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-600/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-blue-400/8 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default StarryBackground;

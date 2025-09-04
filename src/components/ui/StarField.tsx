'use client';

import { useMemo } from 'react';

interface StarFieldProps {
  starCount?: number;
  className?: string;
}

export default function StarField({ starCount = 30, className = "" }: StarFieldProps) {
  // Generate fixed star positions - this prevents them from moving/grouping on re-renders
  const starPositions = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 4,
      animationDuration: 2 + Math.random() * 3,
      size: 1 + Math.random() * 2, // Varied sizes for more natural look
    }));
  }, [starCount]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {starPositions.map((star) => (
        <div
          key={star.id}
          className="absolute bg-blue-300 rounded-full animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}


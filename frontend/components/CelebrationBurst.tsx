'use client';

import { useEffect, useState } from 'react';

interface CelebrationBurstProps {
  /** Increment this to trigger a new 2-second burst. */
  triggerKey: number;
}

const EMOJIS = ['🎉', '✨', '🎊', '⭐'];
const PIECE_COUNT = 14;

const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => {
  const angle = (Math.PI * 2 * i) / PIECE_COUNT;
  const distance = 70 + (i % 3) * 30;
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
    emoji: EMOJIS[i % EMOJIS.length],
    delay: (i % 4) * 40,
  };
});

export function CelebrationBurst({ triggerKey }: CelebrationBurstProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerKey === 0) return;
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timeout);
  }, [triggerKey]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="celebration-piece absolute left-1/2 top-1/3 text-2xl"
          style={
            {
              '--dx': `${piece.dx}px`,
              '--dy': `${piece.dy}px`,
              animationDelay: `${piece.delay}ms`,
            } as React.CSSProperties
          }
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}

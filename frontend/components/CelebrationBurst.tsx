'use client';

import { useEffect, useState } from 'react';

interface CelebrationBurstProps {
  /** Increment this to trigger a new burst. */
  triggerKey: number;
}

const EMOJIS = ['🎉', '✨', '🎊', '⭐', '🎆'];
const PIECES_PER_SIDE = 22;
const BURST_DURATION_MS = 4200;

interface Piece {
  id: number;
  side: 'left' | 'right';
  emoji: string;
  bottomVh: number;
  dxVw: number;
  dyVh: number;
  rotDeg: number;
  delayMs: number;
  durationS: number;
}

function buildPieces(): Piece[] {
  const pieces: Piece[] = [];
  let id = 0;
  for (const side of ['left', 'right'] as const) {
    for (let i = 0; i < PIECES_PER_SIDE; i++) {
      const spread = 40 + Math.random() * 60;
      pieces.push({
        id: id++,
        side,
        emoji: EMOJIS[i % EMOJIS.length],
        bottomVh: Math.random() * 90,
        dxVw: side === 'left' ? spread : -spread,
        dyVh: -(30 + Math.random() * 70),
        rotDeg: (Math.random() - 0.5) * 540,
        delayMs: Math.random() * 1400,
        durationS: 2.2 + Math.random() * 1.4,
      });
    }
  }
  return pieces;
}

export function CelebrationBurst({ triggerKey }: CelebrationBurstProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (triggerKey === 0) return;
    setPieces(buildPieces());
    const timeout = setTimeout(() => setPieces([]), BURST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [triggerKey]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="celebration-piece absolute text-2xl"
          style={
            {
              [piece.side]: '-0.5rem',
              bottom: `${piece.bottomVh}vh`,
              '--dx': `${piece.dxVw}vw`,
              '--dy': `${piece.dyVh}vh`,
              '--rot': `${piece.rotDeg}deg`,
              animationDelay: `${piece.delayMs}ms`,
              animationDuration: `${piece.durationS}s`,
            } as React.CSSProperties
          }
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}

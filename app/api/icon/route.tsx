import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 200,
          height: 200,
          background: '#FFFFFF',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="120"
          height="140"
          viewBox="57 28 86 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bulb body */}
          <path
            d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z"
            stroke="#7c3aed"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Base segments */}
          <line x1="80" y1="144" x2="120" y2="144" stroke="#7c3aed" strokeWidth="7.5" strokeLinecap="round" />
          <line x1="86" y1="157" x2="114" y2="157" stroke="#7c3aed" strokeWidth="7.5" strokeLinecap="round" />
          {/* Filament */}
          <line x1="100" y1="55" x2="100" y2="80" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}

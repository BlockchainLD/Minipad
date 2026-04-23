import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 800,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            background: 'white',
            borderRadius: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="80"
            height="110"
            viewBox="44 15 112 155"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z"
              stroke="#7c3aed"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="80" y1="144" x2="120" y2="144" stroke="#7c3aed" strokeWidth="7.5" strokeLinecap="round" />
            <line x1="86" y1="157" x2="114" y2="157" stroke="#7c3aed" strokeWidth="7.5" strokeLinecap="round" />
            <line x1="100" y1="55" x2="100" y2="80" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.03em',
          }}
        >
          Minipad
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '-0.01em',
          }}
        >
          Submit and build miniapp ideas
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    }
  );
}

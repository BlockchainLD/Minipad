import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 400,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {/* Lightbulb icon */}
        <svg
          width="120"
          height="140"
          viewBox="57 25 86 138"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z"
            stroke="white"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="80" y1="144" x2="120" y2="144" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
          <line x1="86" y1="157" x2="114" y2="157" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
          <line x1="100" y1="55" x2="100" y2="80" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
        {/* App name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          Minipad
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.01em',
          }}
        >
          Submit, remix, and build Farcaster miniapps
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}

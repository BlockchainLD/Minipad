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
            width="100"
            height="112"
            viewBox="0 0 200 225"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M100 8C68 8 17 38 17 88C17 126 40 158 68 170L68 182L132 182L132 170C160 158 183 126 183 88C183 38 132 8 100 8Z" stroke="#7c3aed" strokeWidth="10" strokeLinejoin="round"/>
            <line x1="55" y1="196" x2="145" y2="196" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round"/>
            <line x1="65" y1="214" x2="135" y2="214" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round"/>
            <path d="M52 60L148 60L148 76L124 76L124 136C108 106 92 106 76 136L76 76L52 76Z" fill="#7c3aed"/>
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
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}

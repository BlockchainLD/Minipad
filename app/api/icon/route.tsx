import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 200,
          height: 200,
          background: '#7c3aed',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="130"
          height="146"
          viewBox="0 0 200 225"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M100 8C68 8 17 38 17 88C17 126 40 158 68 170L68 182L132 182L132 170C160 158 183 126 183 88C183 38 132 8 100 8Z" stroke="white" strokeWidth="10" strokeLinejoin="round"/>
          <line x1="55" y1="196" x2="145" y2="196" stroke="white" strokeWidth="10" strokeLinecap="round"/>
          <line x1="65" y1="214" x2="135" y2="214" stroke="white" strokeWidth="10" strokeLinecap="round"/>
          <path d="M52 60L148 60L148 76L124 76L124 136C108 106 92 106 76 136L76 76L52 76Z" fill="white"/>
        </svg>
      </div>
    ),
    {
      width: 200,
      height: 200,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}

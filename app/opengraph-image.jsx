import { ImageResponse } from 'next/og';

// The preview card shown when the link is shared on LinkedIn, WhatsApp, Slack, etc.
export const alt = 'Illuminati Consulting: the best-fit AI for every business problem';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 88,
          backgroundColor: '#030f0c', backgroundImage: 'radial-gradient(circle at 82% 88%, rgba(227,176,75,.38), rgba(3,15,12,0) 55%)',
          color: '#f3ecd9',
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 6, color: '#c49528' }}>ILLUMINATI CONSULTING</div>
        <div style={{ display: 'flex', fontSize: 84, marginTop: 36 }}>
          The&nbsp;<span style={{ color: '#eec84a' }}>best-fit</span>&nbsp;AI
        </div>
        <div style={{ fontSize: 84 }}>for every business problem.</div>
        <div style={{ fontSize: 26, marginTop: 40, color: '#9fb2a8' }}>Insights · Action · Value</div>
      </div>
    ),
    size,
  );
}

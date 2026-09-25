import { Caveat, Inter, Newsreader } from 'next/font/google';
import './globals.css';

// Self-hosted by Next.js, so the headline no longer waits on Google Fonts.
const display = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], variable: '--font-newsreader' });
const sans = Inter({ subsets: ['latin'], variable: '--font-inter' });
const hand = Caveat({ subsets: ['latin'], variable: '--font-caveat', preload: false });

export const metadata = {
  metadataBase: new URL('https://www.illuminaticonsulting.ai'),
  title: 'Illuminati Consulting | The best-fit AI for every business problem',
  description: 'Illuminati Consulting is an AI-first advisory firm. We find the best-fit AI for each business problem, build it with your teams, and prove it in your P&L.',
  openGraph: {
    title: 'Illuminati Consulting | Insights. Action. Value.',
    description: 'AI strategy, Generative AI, Agentic AI and ML, from the first insight to measurable value.',
    siteName: 'Illuminati Consulting',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = { themeColor: '#030f0c' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks "JavaScript is running" before first paint; without it the page falls back to a plain layout. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={
  metadataBase:new URL('https://chesscheese-ten.vercel.app'),
  title:'ChessCheese',
  description:'Review your chess games with local Stockfish analysis.',
  icons:{icon:'/favicon.svg'},
  openGraph:{
    title:'ChessCheese',
    description:'Review your chess games with local Stockfish analysis.',
    siteName:'ChessCheese',
    type:'website',
    locale:'en_US',
    images:[{url:'/og-image.png',width:1200,height:630,alt:'ChessCheese chess analysis preview'}],
  },
  twitter:{
    card:'summary_large_image',
    title:'ChessCheese',
    description:'Review your chess games with local Stockfish analysis.',
    images:['/og-image.png'],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Chesslab · Game analysis',description:'Private, local chess game analysis with Stockfish.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

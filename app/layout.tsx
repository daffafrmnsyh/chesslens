import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Chesslens · Understand your games',description:'Import a PGN, find mistakes, and explore better moves with Stockfish.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

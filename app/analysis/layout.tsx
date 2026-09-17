import type {Metadata} from 'next';

export const metadata:Metadata={
 title:'Game analysis · ChessCheese',
 description:'Import a PGN and review every move locally with Stockfish.',
};

export default function AnalysisLayout({children}:{children:React.ReactNode}){
 return children;
}

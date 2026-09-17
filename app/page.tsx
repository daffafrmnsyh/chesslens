import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  ChartNoAxesCombined,
  FileText,
  GitBranch,
  Heart,
  LockKeyhole,
  Search,
  Upload,
  Zap,
} from 'lucide-react';
import CopySupportLink from '@/components/copy-support-link';

const previewPieces: Record<string, string> = {
  a8: 'bR', d8: 'bQ', e8: 'bK', h8: 'bR', a7: 'bP', b7: 'bP', d7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
  c6: 'bN', f6: 'bN', c5: 'bB', e5: 'bP', c4: 'wB', c3: 'wN', d3: 'wP', e4: 'wP', a2: 'wP', b2: 'wP', c2: 'wP',
  f2: 'wP', g2: 'wP', h2: 'wP', a1: 'wR', d1: 'wQ', e1: 'wK', f1: 'wB', h1: 'wR',
};

const previewMoves = [
  ['1.', 'e4', 'e5'], ['2.', 'Nf3', 'Nc6'], ['3.', 'Bc4', 'Nf6'], ['4.', 'd3', 'Bc5'], ['5.', 'Nc3', 'd6'],
];

const essentials = [
  { icon: Upload, title: 'Import PGN instantly', text: 'Upload or paste your PGN and start analyzing right away.' },
  { icon: FileText, title: 'Detailed move analysis', text: 'Get move classifications like best move, inaccuracy, mistake, and blunder.' },
  { icon: GitBranch, title: 'Explore variations', text: 'Try alternative moves and see how the position changes with engine analysis.' },
  { icon: BarChart3, title: 'Powered by Stockfish', text: 'Accurate analysis with Stockfish, running locally in your browser.' },
  { icon: LockKeyhole, title: 'Local & private', text: 'Your games stay on your device. No account required.' },
  { icon: Zap, title: 'Built for quick review', text: 'Clean and fast interface, optimized for desktop and mobile.' },
];

function Brand() {
  return <Link className="landing-brand" href="/" aria-label="Chesslens home"><span aria-hidden="true">♞</span><strong>Chesslens<i>.</i></strong></Link>;
}

function ProductPreview() {
  const squares = Array.from({ length: 64 }, (_, index) => {
    const file = 'abcdefgh'[index % 8];
    const rank = 8 - Math.floor(index / 8);
    const square = `${file}${rank}`;
    const piece = previewPieces[square];
    return <div className={`landing-preview-square ${(index + Math.floor(index / 8)) % 2 ? 'dark' : 'light'}${square === 'c3' ? ' selected' : ''}`} key={square}>
      {piece && <img src={`/pieces/${piece}.svg`} alt="" draggable={false} />}
      {square === 'c3' && <span className="landing-preview-grade" aria-label="Best move">★</span>}
    </div>;
  });

  return <div className="landing-product-stage" aria-label="Chesslens game review preview">
    <div className="landing-product-preview">
      <div className="landing-preview-top"><Brand /><span>◉ Game review</span><span>Stockfish</span></div>
      <div className="landing-preview-board-wrap">
        <div className="landing-preview-eval" aria-hidden="true"><span /></div>
        <div className="landing-preview-board">{squares}</div>
      </div>
      <div className="landing-preview-review">
        <div className="landing-preview-title"><span><ChartNoAxesCombined size={17} /> Game review</span><small>STOCKFISH</small></div>
        <div className="landing-preview-feedback"><span className="landing-preview-star">★</span><div><strong>Nxd7 is best</strong><p>You found the strongest move.</p></div></div>
        <div className="landing-preview-stats"><div><span>Evaluation</span><strong>+0.82</strong></div><div><span>Best continuation</span><strong>Qxd7</strong></div></div>
        <div className="landing-preview-explorer"><div><strong>Move explorer</strong><span>White</span><span>Black</span></div>{previewMoves.map(([number, white, black], index) => <div className={index === 4 ? 'current' : ''} key={number}><span>{number}</span><span>{white}{index === 4 && <i>★</i>}</span><span>{black}</span></div>)}</div>
      </div>
    </div>
    <span className="landing-sketch-rays" aria-hidden="true">⌁</span>
  </div>;
}

function SketchArrow({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 90 140" aria-hidden="true"><path d="M18 8c44 31 48 68 9 103-6 5-11 8-17 10" /><path d="m10 121 19-2-6-18" /></svg>;
}

export default function LandingPage() {
  return <div className="landing-page">
    <header className="landing-header">
      <Brand />
      <nav aria-label="Primary navigation"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#support">Support</a></nav>
      <Link className="landing-header-cta" href="/analysis">Analyze a game <ArrowRight size={16} /></Link>
    </header>

    <main className="landing-main">
      <section className="landing-hero" id="how-it-works">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">YOUR NEXT MOVE STARTS HERE</p>
          <h1>Understand<br />your chess games,<br />one move at a time.</h1>
          <p className="landing-lede">Import your PGN, find your mistakes, and explore better moves with Stockfish.</p>
          <Link className="landing-primary-cta" href="/analysis">Analyze a game <ArrowRight size={18} /></Link>
          <p className="landing-local-note"><span /> No account required. Analysis stays in your browser.</p>
          <SketchArrow className="landing-hero-arrow" />
        </div>
        <ProductPreview />
        <p className="landing-hand-note landing-hero-note">Analyze.<br />Learn.<br />Play better.<span /></p>
      </section>

      <section className="landing-values" id="features" aria-labelledby="landing-values-title">
        <div className="landing-section-heading"><p className="landing-eyebrow">A CLEARER VIEW OF YOUR GAME</p><h2 id="landing-values-title">Review the moves that mattered.</h2></div>
        <div className="landing-value-grid">
          <article><span><Search /></span><h3>Understand every move</h3><p>See which moves were strong, inaccurate, or costly and understand where the game changed.</p></article>
          <article><span><GitBranch /></span><h3>Explore better lines</h3><p>Try alternative moves directly on the board and analyze the resulting positions with Stockfish.</p></article>
          <article className="landing-stockfish-card"><span><BarChart3 /></span><h3>Powered by Stockfish</h3><p>Review your games with local engine analysis directly in your browser.</p><img className="landing-stockfish-piece" src="/pieces/bQ.svg" alt="Black chess queen" /></article>
        </div>
      </section>

      <section className="landing-essentials" id="why-chesslens" aria-labelledby="landing-essentials-title">
        <div className="landing-section-heading"><p className="landing-eyebrow">WHY CHESSLENS</p><h2 id="landing-essentials-title">Everything you need<br />to review your games.</h2></div>
        <p className="landing-hand-note landing-insights-note">More insights.<br />Stronger games.<span /></p>
        <div className="landing-essential-grid">
          {essentials.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon /></span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="landing-support" id="support" aria-labelledby="landing-support-title">
        <div className="landing-support-copy">
          <p className="landing-eyebrow">SUPPORT CHESSLENS</p>
          <h2 id="landing-support-title">Enjoying Chesslens?</h2>
          <p>If this project helps you review your games, consider supporting its development through Saweria.</p>
          <div className="landing-support-actions">
            <a className="landing-support-primary" href="https://saweria.co/daffafrmnsyh" target="_blank" rel="noreferrer"><Heart size={17} /> Support via Saweria <ArrowRight size={16} /></a>
            <CopySupportLink />
          </div>
        </div>
        <div className="landing-support-divider" aria-hidden="true" />
        <div className="landing-qr-wrap"><img src="/saweria-qr.png" alt="Saweria QR code for Daffa Firmansyah" /><p><span>×</span> saweria.co/daffafrmnsyh</p></div>
        <div className="landing-support-sketch"><p className="landing-hand-note">Small support<br />keeps this project<br />going. ♡</p><SketchArrow className="landing-support-arrow" /></div>
      </section>
    </main>

    <footer className="landing-footer">
      <div><Brand /><p>See your game more clearly.</p></div>
      <div><strong>Product</strong><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#support">Support</a></div>
      <div><strong>Resources</strong><a href="https://www.chess.com/learn-how-to-play-chess" target="_blank" rel="noreferrer">Chess basics</a><a href="mailto:daffafrmnsyh@gmail.com">Feedback</a></div>
      <div className="landing-footer-maker"><p>Made with 💚<br />by Daffa Firmansyah</p><a href="https://saweria.co/daffafrmnsyh" target="_blank" rel="noreferrer">saweria.co/daffafrmnsyh <ArrowRight size={14} /></a></div>
    </footer>
  </div>;
}

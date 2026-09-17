'use client';

import {Check, Link2} from 'lucide-react';
import {useState} from 'react';

const supportUrl = 'https://saweria.co/daffafrmnsyh';

export default function CopySupportLink() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(supportUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <button className="landing-copy-link" type="button" onClick={copyLink} aria-live="polite">
    {copied ? <Check size={17} /> : <Link2 size={17} />} {copied ? 'Copied' : 'Copy link'}
  </button>;
}

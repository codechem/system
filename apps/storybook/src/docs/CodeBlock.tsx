import React, { useState } from 'react';

/** A deliberately plain renderer: code must remain readable even without highlighting. */
export function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [status, setStatus] = useState('Copy');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code.trimEnd());
      setStatus('Copied');
    } catch {
      setStatus('Select code to copy');
    }
  }
  return (
    <div className="cc-code sb-unstyled">
      <div className="cc-code-toolbar">
        <span>{language}</span>
        <button type="button" onClick={copy}>
          {status}
        </button>
        <span className="cc-sr-only" role="status">
          {status === 'Copied' ? 'Code copied to clipboard' : ''}
        </span>
      </div>
      <pre tabIndex={0}>
        <code>{code.trimEnd()}</code>
      </pre>
    </div>
  );
}

/** Storybook's default fenced-code renderer currently drops the code contents. */
export function MarkdownCode({ children, className }: { children: string; className?: string }) {
  return className?.startsWith('language-') || children.includes('\n') ? (
    <CodeBlock code={children} language={className?.replace('language-', '')} />
  ) : (
    <code>{children}</code>
  );
}

export function MarkdownPre({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

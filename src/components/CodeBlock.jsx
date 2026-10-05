import { createSignal } from 'solid-js';
import Icon from './Icon';

// Shell snippet with a copy button. Lines starting with # are shown as comments.
export default function CodeBlock(props) {
  const [copied, setCopied] = createSignal(false);
  let timer;
  const text = () => props.code.trim();
  const copyable = () =>
    text()
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .map((l) => l.replace(/\s+#\s.*$/, ''))
      .join('\n')
      .trim();

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyable());
      setCopied(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div class="code" classList={{ [props.class]: !!props.class }}>
      {props.title && <div class="code__title">{props.title}</div>}
      <pre>
        <code>
          {text()
            .split('\n')
            .map((line, i, lines) => {
              // A line carrying on from a trailing backslash is the same command: no prompt.
              if (i > 0 && lines[i - 1].trimEnd().endsWith('\\')) return <span class="code__l code__l--cont">{line}</span>;
              const hash = line.search(/(^|\s)#\s/);
              if (hash === -1) return <span class="code__l">{line}</span>;
              const command = line.slice(0, hash).trimEnd();
              const comment = line.slice(hash).trim();
              // A line that is only a comment gets no $ prompt.
              if (!command) return <span class="code__l code__l--note">{comment}</span>;
              return (
                <span class="code__l">
                  {command}
                  <span class="code__c">{comment}</span>
                </span>
              );
            })}
        </code>
      </pre>
      <button type="button" class="code__copy" onClick={copy} aria-label={copied() ? 'Copied' : 'Copy to clipboard'}>
        <Icon name={copied() ? 'check' : 'copy'} size={16} />
        <span>{copied() ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

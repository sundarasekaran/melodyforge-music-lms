import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Safely parses and renders inline Markdown tokens (**bold**, *italic*, `code`, [link](url))
 */
const renderInline = (text: string): React.ReactNode[] => {
  // Regex matches: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*[\s\S]+?\*\*|\*[^\s*][\s\S]*?[^\s*]\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-white tracking-normal">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-indigo-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

/**
 * Responsive Markdown block renderer.
 * Formats headings, bulleted lists, and paragraphs with automatic word-wrapping.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into raw double-newline paragraphs
  const rawBlocks = content.split(/\n\n+/);

  return (
    <div
      className={`markdown-content w-full min-w-0 max-w-full text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 break-words [overflow-wrap:anywhere] ${className}`}
    >
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Level 3 Heading: ### Heading
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          return (
            <h3
              key={blockIdx}
              className="text-base sm:text-lg lg:text-xl font-bold text-indigo-300 mt-6 mb-2 tracking-tight flex items-center gap-2"
            >
              <span className="w-1.5 h-4 sm:h-5 bg-indigo-500 rounded-full shrink-0" />
              <span>{renderInline(headingText)}</span>
            </h3>
          );
        }

        // 2. Level 2 Heading: ## Heading
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          return (
            <h2
              key={blockIdx}
              className="text-lg sm:text-xl lg:text-2xl font-black text-white mt-7 mb-3 tracking-tight"
            >
              {renderInline(headingText)}
            </h2>
          );
        }

        // 3. Level 1 Heading: # Heading
        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#\s+/, '');
          return (
            <h1
              key={blockIdx}
              className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-8 mb-4 tracking-tight"
            >
              {renderInline(headingText)}
            </h1>
          );
        }

        // 4. Blockquote: > Quote
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s+/, '');
          return (
            <blockquote
              key={blockIdx}
              className="pl-4 py-2 border-l-2 border-indigo-500 bg-indigo-950/20 rounded-r-xl italic text-slate-300 text-xs sm:text-sm my-3"
            >
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // 5. Check if block contains list items mixed with introductory text
        const lines = trimmed.split('\n');
        const hasListItems = lines.some((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));

        if (hasListItems) {
          const introLines: string[] = [];
          const listItems: string[] = [];
          let collectingList = false;

          for (const line of lines) {
            const lineTrim = line.trim();
            if (lineTrim.startsWith('- ') || lineTrim.startsWith('* ')) {
              collectingList = true;
              listItems.push(lineTrim.replace(/^[-*]\s+/, ''));
            } else if (!collectingList) {
              introLines.push(line);
            } else {
              // Append to last list item if continuation
              if (listItems.length > 0) {
                listItems[listItems.length - 1] += ` ${lineTrim}`;
              }
            }
          }

          return (
            <div key={blockIdx} className="space-y-2 my-3">
              {introLines.length > 0 && (
                <p className="text-slate-200 leading-relaxed break-words">
                  {renderInline(introLines.join(' '))}
                </p>
              )}
              {listItems.length > 0 && (
                <ul className="space-y-1.5 pl-2 sm:pl-3 my-2 text-slate-300">
                  {listItems.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <span className="flex-1 min-w-0 break-words">{renderInline(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        // 6. Regular Paragraph
        return (
          <p key={blockIdx} className="text-slate-200 leading-relaxed break-words">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

'use client';

import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

// Parse markdown into blocks for memoization
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

// Memoized individual markdown block component
const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium mb-2 mt-3 first:mt-0">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-medium mb-2 mt-3 first:mt-0">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-6">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground pl-4 mb-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, node, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                style={darcula as any}
                language={match[1]}
                PreTag="div"
                className="my-4"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre {...props}>{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-muted">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-muted">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-muted px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-muted px-3 py-2">{children}</td>
          ),
          hr: () => (
            <hr className="my-6 border-muted" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if content changes
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

// Main memoized markdown component
export const Markdown = memo(
  ({ content, className }: MarkdownProps) => {
    const blocks = useMemo(() => {
      if (!content.trim()) return [];
      return parseMarkdownIntoBlocks(content);
    }, [content]);

    // Generate a unique ID for this content to help with memoization
    const contentId = useMemo(() => {
      return content.length.toString() + content.slice(0, 10).replace(/\s/g, '');
    }, [content]);

    return (
      <div className={cn('markdown-content', className)}>
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock 
            key={`${contentId}-block_${index}`}
            content={block}
          />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if content or className changes
    return prevProps.content === nextProps.content && prevProps.className === nextProps.className;
  }
);

Markdown.displayName = 'Markdown'; 

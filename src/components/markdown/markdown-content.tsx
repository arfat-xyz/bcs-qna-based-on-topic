import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Copy, Check } from 'lucide-react';

interface MarkdownContentProps {
  content?: string;
  topicHeading: string;
}

export function MarkdownContent({ content, topicHeading }: MarkdownContentProps) {
  if (!content || content.trim().length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="study-notes-heading"
      className="mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="study-notes-heading"
            className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight"
          >
            Study Notes & Deep Dive
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Comprehensive reference notes and grammar rules for {topicHeading}
          </p>
        </div>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-6 sm:mt-8 mb-3 sm:mb-4 tracking-tight border-b border-neutral-200 dark:border-neutral-800 pb-2 break-words">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-5 sm:mt-7 mb-3 tracking-tight flex items-center gap-2 break-words">
                <span className="w-1.5 h-4 sm:h-5 bg-indigo-600 rounded-full inline-block shrink-0" />
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-4 sm:mt-5 mb-2 break-words">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base mb-4 font-normal break-words">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base mb-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base mb-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed pl-1">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 sm:my-5 pl-3.5 sm:pl-5 border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 py-2.5 sm:py-3 pr-3 sm:pr-4 rounded-r-xl italic text-neutral-800 dark:text-neutral-200 text-sm sm:text-base break-words">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="my-5 sm:my-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs -mx-1 sm:mx-0">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[460px]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900/60">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold tracking-wider text-[11px] sm:text-xs uppercase text-neutral-700 dark:text-neutral-300">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-neutral-700 dark:text-neutral-300 break-words">
                {children}
              </td>
            ),
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !String(children).includes('\n');

              if (isInline) {
                return (
                  <code
                    className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300 border border-neutral-200 dark:border-neutral-700"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-sm shadow-md">
                  {match && (
                    <div className="px-4 py-2 bg-neutral-800/80 border-b border-neutral-700/60 text-xs text-neutral-400 flex items-center justify-between">
                      <span>{match[1]}</span>
                    </div>
                  )}
                  <pre className="p-4 overflow-x-auto leading-relaxed">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-8 border-t border-neutral-200 dark:border-neutral-800" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}

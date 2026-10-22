import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, EyeOff } from 'lucide-react';

interface QuestionCardProps {
  id?: string;
  questionId?: string;
  answerId?: string;
  index: number;
  question: string;
  answer: string;
  isRevealed: boolean;
  onToggle: () => void;
}

export function QuestionCard({
  id,
  questionId: customQuestionId,
  answerId: customAnswerId,
  index,
  question,
  answer,
  isRevealed,
  onToggle,
}: QuestionCardProps) {
  const cardId = id || `q-${index + 1}`;
  const effectiveQuestionId = customQuestionId || `question-${cardId}`;
  const effectiveAnswerId = customAnswerId || `answer-${cardId}`;
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <div
      id={cardId}
      className={`group relative rounded-2xl border transition-all duration-200 scroll-mt-24 ${
        isRevealed
          ? 'bg-white dark:bg-neutral-900 border-indigo-200 dark:border-indigo-900/60 shadow-md shadow-indigo-500/5'
          : 'bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Header bar with question number, ID badge, markdown text, and eye button */}
      <div className="p-4 sm:p-5 md:p-6 flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 sm:gap-3.5 md:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold tracking-wider transition-colors ${
                isRevealed
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
              }`}
              aria-hidden="true"
            >
              {formattedIndex}
            </span>
            {id && (
              <span
                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-tight bg-neutral-100 dark:bg-neutral-800/90 text-neutral-500 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/80"
                title={`Question ID: ${id}`}
              >
                #{id}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              id={effectiveQuestionId}
              className="text-sm sm:text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-200 leading-snug tracking-tight break-words"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <span className="inline">{children}</span>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300 border border-neutral-200 dark:border-neutral-700">
                      {children}
                    </code>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-neutral-950 dark:text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {question}
              </ReactMarkdown>
            </h3>
          </div>
        </div>

        {/* Eye reveal button */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isRevealed}
          aria-controls={effectiveAnswerId}
          aria-label={
            isRevealed
              ? `Hide answer for question ${id || index + 1}`
              : `Show answer for question ${id || index + 1}`
          }
          title={isRevealed ? 'Hide answer' : 'Reveal answer'}
          className={`shrink-0 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-95 cursor-pointer ${
            isRevealed
              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/80'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {isRevealed ? (
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Answer Area with Rich Markdown Support */}
      <div
        id={effectiveAnswerId}
        role="region"
        aria-labelledby={effectiveQuestionId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isRevealed ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1">
          <div className="relative pl-3.5 sm:pl-5 border-l-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-xl py-3 sm:py-3.5 pr-3 sm:pr-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Answer
              </span>
              {id && (
                <span
                  className="font-mono text-[10px] font-semibold text-indigo-600/80 dark:text-indigo-400/80"
                  title={`Answer ID: ${effectiveAnswerId}`}
                >
                  ID: {id}
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-neutral-950 dark:text-white">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-neutral-700 dark:text-neutral-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-neutral-700 dark:text-neutral-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="my-2.5 pl-3 border-l-2 border-indigo-400 dark:border-indigo-500 italic bg-indigo-100/30 dark:bg-indigo-950/30 py-1.5 pr-2 rounded-r-lg text-neutral-700 dark:text-neutral-300">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md font-mono text-[11px] sm:text-xs bg-indigo-50/80 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-neutral-700"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="my-2.5 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 font-mono text-xs shadow-inner">
                        {match && (
                          <div className="px-3 py-1 bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 font-sans font-semibold">
                            {match[1]}
                          </div>
                        )}
                        <pre className="p-3 overflow-x-auto leading-relaxed">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <table className="w-full text-left border-collapse text-xs">
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
                  th: ({ children }) => (
                    <th className="py-2 px-3 font-semibold text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="py-2 px-3 text-neutral-700 dark:text-neutral-300">
                      {children}
                    </td>
                  ),
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
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

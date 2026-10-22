import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface QuestionCardProps {
  index: number;
  question: string;
  answer: string;
  isRevealed: boolean;
  onToggle: () => void;
}

export function QuestionCard({
  index,
  question,
  answer,
  isRevealed,
  onToggle,
}: QuestionCardProps) {
  const questionId = `question-${index}`;
  const answerId = `answer-${index}`;
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isRevealed
          ? 'bg-white dark:bg-neutral-900 border-indigo-200 dark:border-indigo-900/60 shadow-md shadow-indigo-500/5'
          : 'bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Header bar with question number, text, and eye button */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
          <span
            className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-xl text-xs font-bold tracking-wider transition-colors ${
              isRevealed
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
            }`}
            aria-hidden="true"
          >
            {formattedIndex}
          </span>
          <div className="flex-1 pt-0.5">
            <h3
              id={questionId}
              className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug tracking-tight"
            >
              {question}
            </h3>
          </div>
        </div>

        {/* Eye reveal button */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isRevealed}
          aria-controls={answerId}
          aria-label={
            isRevealed
              ? `Hide answer for question ${index + 1}: ${question}`
              : `Show answer for question ${index + 1}: ${question}`
          }
          title={isRevealed ? 'Hide answer' : 'Reveal answer'}
          className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-95 ${
            isRevealed
              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/80'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {isRevealed ? (
            <EyeOff className="w-5 h-5 transition-transform duration-150" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5 transition-transform duration-150" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Answer Area */}
      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isRevealed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 sm:px-6 pb-6 pt-1">
          <div className="relative pl-4 sm:pl-5 border-l-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-xl py-3.5 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
              Answer
            </span>
            <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2, RotateCcw } from 'lucide-react';
import type { QuestionItem } from '../../types/topic';
import { QuestionCard } from './question-card';

interface QuestionListProps {
  items: QuestionItem[];
  topicHeading: string;
}

export function QuestionList({ items, topicHeading }: QuestionListProps) {
  // State for revealed items: index -> boolean
  const [revealedState, setRevealedState] = useState<Record<number, boolean>>({});

  // Reset revealed state if items change (e.g. navigation between topics)
  useEffect(() => {
    setRevealedState({});
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
          No questions currently available in this study topic.
        </p>
      </div>
    );
  }

  const totalQuestions = items.length;
  const revealedCount = Object.values(revealedState).filter(Boolean).length;
  const allRevealed = revealedCount === totalQuestions;

  const toggleSingle = (index: number) => {
    setRevealedState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAll = () => {
    if (allRevealed) {
      // Hide all
      setRevealedState({});
    } else {
      // Show all
      const nextState: Record<number, boolean> = {};
      items.forEach((_, idx) => {
        nextState[idx] = true;
      });
      setRevealedState(nextState);
    }
  };

  const resetAll = () => {
    setRevealedState({});
  };

  return (
    <section aria-labelledby="qa-section-heading" className="space-y-6">
      {/* Control Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              id="qa-section-heading"
              className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider"
            >
              Study Questions
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {totalQuestions} {totalQuestions === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 border-l border-neutral-300 dark:border-neutral-700 pl-3">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                revealedCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'
              }`}
            />
            <span>
              {revealedCount} of {totalQuestions} revealed
            </span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {revealedCount > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
              title="Reset all cards to hidden"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleAll}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
              allRevealed
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30'
            }`}
          >
            {allRevealed ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide All Answers</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show All Answers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Cards List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <QuestionCard
            key={`${topicHeading}-q-${index}`}
            index={index}
            question={item.question}
            answer={item.answer}
            isRevealed={Boolean(revealedState[index])}
            onToggle={() => toggleSingle(index)}
          />
        ))}
      </div>
    </section>
  );
}

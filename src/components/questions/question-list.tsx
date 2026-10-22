import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from 'lucide-react';
import type { QuestionItem } from '../../types/topic';
import { QuestionCard } from './question-card';

const PAGE_SIZE = 5;

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface QuestionListProps {
  items: QuestionItem[];
  topicHeading: string;
}

export function QuestionList({ items, topicHeading }: QuestionListProps) {
  // Shuffle once per mount — stored in a ref so it survives re-renders
  const shuffledRef = useRef<QuestionItem[] | null>(null);
  if (shuffledRef.current === null || shuffledRef.current.length !== items.length) {
    shuffledRef.current = shuffleArray(items);
  }
  const shuffledItems = shuffledRef.current;

  const [currentPage, setCurrentPage] = useState(0);
  // revealedState keyed by item id (or fallback index string)
  const [revealedState, setRevealedState] = useState<Record<string, boolean>>({});

  // Reset everything when topic changes
  useEffect(() => {
    shuffledRef.current = shuffleArray(items);
    setCurrentPage(0);
    setRevealedState({});
  }, [topicHeading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
          No questions currently available in this study topic.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(shuffledItems.length / PAGE_SIZE);
  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageItems = shuffledItems.slice(pageStart, pageEnd);

  // Key helper — use item id if present, otherwise fall back to shuffled index
  const itemKey = (item: QuestionItem, shuffledIndex: number) =>
    item.id != null ? String(item.id) : `idx-${shuffledIndex}`;

  const pageKeys = pageItems.map((item, i) => itemKey(item, pageStart + i));

  const revealedOnPage = pageKeys.filter((k) => revealedState[k]).length;
  const allRevealedOnPage = revealedOnPage === pageItems.length;

  const toggleSingle = (key: string) => {
    setRevealedState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    if (allRevealedOnPage) {
      setRevealedState((prev) => {
        const next = { ...prev };
        pageKeys.forEach((k) => delete next[k]);
        return next;
      });
    } else {
      setRevealedState((prev) => {
        const next = { ...prev };
        pageKeys.forEach((k) => { next[k] = true; });
        return next;
      });
    }
  };

  const resetPage = () => {
    setRevealedState((prev) => {
      const next = { ...prev };
      pageKeys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalRevealed = Object.values(revealedState).filter(Boolean).length;

  return (
    <section aria-labelledby="qa-section-heading" className="space-y-5 sm:space-y-6">

      {/* ── Control Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800">
        {/* Left — title + counters */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              id="qa-section-heading"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider"
            >
              Study Questions
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {shuffledItems.length} {shuffledItems.length === 1 ? 'Card' : 'Cards'}
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 sm:border-l sm:border-neutral-300 sm:dark:border-neutral-700 sm:pl-3">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                totalRevealed > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'
              }`}
            />
            <span>{totalRevealed} of {shuffledItems.length}</span>
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          {revealedOnPage > 0 && (
            <button
              type="button"
              onClick={resetPage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Reset this page to hidden"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleAll}
            className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
              allRevealedOnPage
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30'
            }`}
          >
            {allRevealedOnPage ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide All</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Shuffle indicator ── */}
      <div className="flex items-center gap-2 px-1 text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500">
        <Shuffle className="w-3 h-3 shrink-0" />
        <span>
          Questions are randomly shuffled each session — Page {currentPage + 1} of {totalPages}
        </span>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-4">
        {pageItems.map((item, pageLocalIndex) => {
          const shuffledIndex = pageStart + pageLocalIndex;
          const key = itemKey(item, shuffledIndex);
          return (
            <QuestionCard
              key={`${topicHeading}-${key}`}
              id={item.id != null ? String(item.id) : undefined}
              index={shuffledIndex}
              question={item.question}
              answer={item.answer}
              isRevealed={Boolean(revealedState[key])}
              onToggle={() => toggleSingle(key)}
            />
          );
        })}
      </div>

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Prev */}
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page number pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => {
              // Show first, last, current, and neighbors; collapse others to ellipsis
              const isActive = i === currentPage;
              const isVisible =
                i === 0 ||
                i === totalPages - 1 ||
                Math.abs(i - currentPage) <= 1;

              if (!isVisible) {
                // Only render one ellipsis per gap
                const prevVisible =
                  i - 1 === 0 ||
                  i - 1 === totalPages - 1 ||
                  Math.abs(i - 1 - currentPage) <= 1;
                if (prevVisible) {
                  return (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-8 h-8 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm"
                    >
                      …
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Page item range info ── */}
      {totalPages > 1 && (
        <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-600 pb-1">
          Showing cards {pageStart + 1}–{Math.min(pageEnd, shuffledItems.length)} of {shuffledItems.length}
        </p>
      )}
    </section>
  );
}

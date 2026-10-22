import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Search,
  X,
  Layers,
} from 'lucide-react';
import type { QuestionItem } from '../../types/topic';
import { QuestionCard } from './question-card';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;
const DEFAULT_PAGE_SIZE = 20;

/* ════════════════════════════════════════════════════════════════════════════
   URL query-param helpers — all params are synced to the URL so they survive
   browser reload and back/forward navigation.

   Params:  ?page=2&perPage=10&q=searchterm
   ════════════════════════════════════════════════════════════════════════ */

function getParams(): { page: number; perPage: number; q: string } {
  const sp = new URLSearchParams(window.location.search);

  const rawPage = sp.get('page');
  const page =
    rawPage !== null && Number.isFinite(parseInt(rawPage, 10)) && parseInt(rawPage, 10) >= 1
      ? parseInt(rawPage, 10) - 1 // 1-indexed in URL → 0-indexed internally
      : 0;

  const rawPP = sp.get('perPage');
  const perPage =
    rawPP !== null && PAGE_SIZE_OPTIONS.includes(parseInt(rawPP, 10) as (typeof PAGE_SIZE_OPTIONS)[number])
      ? parseInt(rawPP, 10)
      : DEFAULT_PAGE_SIZE;

  const q = sp.get('q') ?? '';

  return { page, perPage, q };
}

function setParams(
  updates: Partial<{ page: number; perPage: number; q: string }>,
  replace = false,
) {
  const url = new URL(window.location.href);

  if ('page' in updates) {
    if (updates.page === undefined || updates.page <= 0) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', String(updates.page + 1)); // store 1-indexed
    }
  }

  if ('perPage' in updates) {
    if (updates.perPage === undefined || updates.perPage === DEFAULT_PAGE_SIZE) {
      url.searchParams.delete('perPage');
    } else {
      url.searchParams.set('perPage', String(updates.perPage));
    }
  }

  if ('q' in updates) {
    if (!updates.q) {
      url.searchParams.delete('q');
    } else {
      url.searchParams.set('q', updates.q);
    }
  }

  if (replace) {
    window.history.replaceState(null, '', url.toString());
  } else {
    window.history.pushState(null, '', url.toString());
  }
}

/* ─── Fisher-Yates shuffle ─── */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ════════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════════ */

interface QuestionListProps {
  items: QuestionItem[];
  topicHeading: string;
}

export function QuestionList({ items, topicHeading }: QuestionListProps) {
  /* ── Shuffle (once per mount / topic change) ── */
  const shuffledRef = useRef<QuestionItem[] | null>(null);
  const prevTopicRef = useRef<string>(topicHeading);

  if (
    shuffledRef.current === null ||
    prevTopicRef.current !== topicHeading ||
    shuffledRef.current.length !== items.length
  ) {
    shuffledRef.current = shuffleArray(items);
    prevTopicRef.current = topicHeading;
  }
  const shuffledItems = shuffledRef.current;

  /* ── State from URL ── */
  const initial = useRef(getParams()).current;
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [perPage, setPerPage] = useState(initial.perPage);
  const [searchQuery, setSearchQuery] = useState(initial.q);
  const [revealedState, setRevealedState] = useState<Record<string, boolean>>({});

  // Debounced search for URL sync
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Reset on topic change ── */
  useEffect(() => {
    shuffledRef.current = shuffleArray(items);
    prevTopicRef.current = topicHeading;
    const params = getParams();
    setCurrentPage(params.page);
    setPerPage(params.perPage);
    setSearchQuery(params.q);
    setRevealedState({});
  }, [topicHeading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Listen for browser back/forward ── */
  useEffect(() => {
    const handlePopstate = () => {
      const params = getParams();
      setCurrentPage(params.page);
      setPerPage(params.perPage);
      setSearchQuery(params.q);
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  /* ── Filtered items (search) ── */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return shuffledItems;
    const lower = searchQuery.toLowerCase().trim();
    return shuffledItems.filter(
      (item) =>
        item.question.toLowerCase().includes(lower) ||
        item.answer.toLowerCase().includes(lower) ||
        (item.id != null && String(item.id).toLowerCase().includes(lower)),
    );
  }, [shuffledItems, searchQuery]);

  /* ── Pagination math ── */
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const clampedPage = Math.min(currentPage, totalPages - 1);
  // Auto-clamp if page overflows (e.g. search narrowed results)
  useEffect(() => {
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
      setParams({ page: clampedPage }, true);
    }
  }, [clampedPage, currentPage]);

  const pageStart = clampedPage * perPage;
  const pageEnd = pageStart + perPage;
  const pageItems = filteredItems.slice(pageStart, pageEnd);

  /* ── Key helpers ── */
  const itemKey = (item: QuestionItem, shuffledIndex: number) =>
    item.id != null ? String(item.id) : `idx-${shuffledIndex}`;

  const pageKeys = pageItems.map((item, i) => itemKey(item, pageStart + i));
  const revealedOnPage = pageKeys.filter((k) => revealedState[k]).length;
  const allRevealedOnPage = pageItems.length > 0 && revealedOnPage === pageItems.length;
  const totalRevealed = Object.values(revealedState).filter(Boolean).length;

  /* ── Navigation ── */
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clamped);
      setParams({ page: clamped });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages],
  );

  /* ── Per-page change ── */
  const handlePerPageChange = useCallback(
    (newSize: number) => {
      setPerPage(newSize);
      setCurrentPage(0);
      setParams({ perPage: newSize, page: 0 });
    },
    [],
  );

  /* ── Search change (debounced URL sync) ── */
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setParams({ q: value, page: 0 }, true);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(0);
    setParams({ q: '', page: 0 }, true);
  }, []);

  /* ── Card actions ── */
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
        pageKeys.forEach((k) => {
          next[k] = true;
        });
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

  /* ── Empty state ── */
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
          No questions currently available in this study topic.
        </p>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════════════ */
  return (
    <section aria-labelledby="qa-section-heading" className="space-y-5 sm:space-y-6">

      {/* ── Control Bar ── */}
      <div className="flex flex-col gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800">
        {/* Row 1: Title + Counters + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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
                {filteredItems.length}
                {filteredItems.length !== shuffledItems.length && ` / ${shuffledItems.length}`}
                {' '}{shuffledItems.length === 1 ? 'Card' : 'Cards'}
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

        {/* Row 2: Search + Per-page selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search questions & answers…"
              className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-xl text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all"
              aria-label="Search questions"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Per-page selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePerPageChange(size)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    perPage === size
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                  title={`Show ${size} cards per page`}
                  aria-label={`${size} cards per page`}
                  aria-pressed={perPage === size}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:inline whitespace-nowrap">
              per page
            </span>
          </div>
        </div>
      </div>

      {/* ── Shuffle + page indicator ── */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500">
          <Shuffle className="w-3 h-3 shrink-0" />
          <span>Questions shuffled each session</span>
        </div>
        {totalPages > 1 && (
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
            Page {clampedPage + 1} / {totalPages}
          </span>
        )}
      </div>

      {/* ── No search results ── */}
      {searchQuery.trim() && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 sm:p-8 text-center bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
          <Search className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            No questions match "<span className="font-semibold text-neutral-700 dark:text-neutral-200">{searchQuery}</span>"
          </p>
          <button
            type="button"
            onClick={clearSearch}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Cards ── */}
      {pageItems.length > 0 && (
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
      )}

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-2 sm:gap-3 pt-2"
        >
          {/* Prev */}
          <button
            type="button"
            onClick={() => goToPage(clampedPage - 1)}
            disabled={clampedPage === 0}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page number pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = i === clampedPage;
              const isVisible =
                i === 0 || i === totalPages - 1 || Math.abs(i - clampedPage) <= 1;

              if (!isVisible) {
                const prevVisible =
                  i - 1 === 0 ||
                  i - 1 === totalPages - 1 ||
                  Math.abs(i - 1 - clampedPage) <= 1;
                if (prevVisible) {
                  return (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm select-none"
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
                  className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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
            onClick={() => goToPage(clampedPage + 1)}
            disabled={clampedPage === totalPages - 1}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}

      {/* ── Page range info ── */}
      {filteredItems.length > 0 && (
        <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-600 pb-1">
          Showing cards {pageStart + 1}–{Math.min(pageEnd, filteredItems.length)} of{' '}
          {filteredItems.length}
          {searchQuery.trim() && ` (filtered from ${shuffledItems.length})`}
        </p>
      )}
    </section>
  );
}

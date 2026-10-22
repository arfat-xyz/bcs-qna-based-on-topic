import React from 'react';
import { FileQuestion, PlusCircle, SearchX } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-topics' | 'search-empty';
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function EmptyState({
  type = 'no-topics',
  searchQuery,
  onClearSearch,
}: EmptyStateProps) {
  if (type === 'search-empty') {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto">
        <div className="inline-flex p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          No topics matched "{searchQuery}"
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Try adjusting your search keywords, or clear the filter to browse all study modules.
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Clear Search Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-6 max-w-lg mx-auto rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40">
      <div className="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        No Learning Topics Found
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
        Get started by creating a JSON file inside the <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs text-indigo-600 dark:text-indigo-400">src/data/topics/</code> directory.
      </p>

      <div className="text-left bg-neutral-900 text-neutral-200 p-4 rounded-xl text-xs font-mono mb-4 overflow-x-auto shadow-inner">
        <div className="text-neutral-400 mb-1">// Example: src/data/topics/syntax.json</div>
        <pre>{`{
  "heading": "Sentence Structure",
  "subheading": "Clauses and predicates",
  "items": [
    {
      "question": "What is an independent clause?",
      "answer": "A clause that can stand alone as a sentence."
    }
  ]
}`}</pre>
      </div>

      <div className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <PlusCircle className="w-4 h-4 text-indigo-500" />
        <span>New JSON files are discovered automatically on build!</span>
      </div>
    </div>
  );
}

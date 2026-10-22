import React from 'react';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';
import type { TopicMetadata } from '../../types/topic';

interface NotFoundProps {
  invalidSlug: string;
  availableTopics: { slug: string; metadata: TopicMetadata }[];
  onNavigateHome: () => void;
  onNavigateTopic: (slug: string) => void;
}

export function NotFound({
  invalidSlug,
  availableTopics,
  onNavigateHome,
  onNavigateTopic,
}: NotFoundProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8">
      <div className="inline-flex p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
        <AlertCircle className="w-12 h-12" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          404 Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Topic "{invalidSlug}" Does Not Exist
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          We couldn't locate a valid JSON data file for this study topic. It may have been removed or renamed.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>

      {availableTopics.length > 0 && (
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Available Topics You Can Study
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableTopics.slice(0, 6).map(({ slug, metadata }) => (
              <button
                key={slug}
                type="button"
                onClick={() => onNavigateTopic(slug)}
                className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-neutral-900 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
              >
                <span>{metadata.heading}</span>
                <span className="text-neutral-400 text-[11px]">{metadata.questionCount} Qs</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

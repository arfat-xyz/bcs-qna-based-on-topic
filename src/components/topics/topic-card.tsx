import React from 'react';
import { ArrowRight, HelpCircle, FileText, Sparkles } from 'lucide-react';
import type { TopicMetadata } from '../../types/topic';

interface TopicCardProps {
  metadata: TopicMetadata;
  onClick: (slug: string) => void;
}

export function TopicCard({ metadata, onClick }: TopicCardProps) {
  const { slug, heading, subheading, questionCount, hasMarkdownContent } = metadata;

  // Generate an accent color or icon based on slug
  const getBadgeMeta = () => {
    const s = slug.toLowerCase();
    if (s.includes('idiom')) {
      return { label: 'Vocabulary', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' };
    }
    if (s.includes('parts') || s.includes('preposition') || s.includes('grammar')) {
      return { label: 'Grammar', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50' };
    }
    if (s.includes('computer') || s.includes('tech') || s.includes('code')) {
      return { label: 'Technology', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' };
    }
    if (s.includes('solar') || s.includes('science') || s.includes('space')) {
      return { label: 'Astronomy', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' };
    }
    return { label: 'Learning Topic', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' };
  };

  const badge = getBadgeMeta();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(slug);
        }
      }}
      className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div>
        {/* Category & Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${badge.color}`}
          >
            {badge.label}
          </span>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            {hasMarkdownContent && (
              <span className="flex items-center gap-1 font-medium text-neutral-500 dark:text-neutral-400" title="Includes study notes">
                <FileText className="w-3.5 h-3.5" />
                Notes
              </span>
            )}
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight mb-2">
          {heading}
        </h3>

        {/* Optional Subheading */}
        {subheading && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-6">
            {subheading}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          Study Topic
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

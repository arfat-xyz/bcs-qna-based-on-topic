import React from 'react';
import { ChevronRight, Home, ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import type { Topic, TopicMetadata } from '../../types/topic';
import { QuestionList } from '../questions/question-list';
import { MarkdownContent } from '../markdown/markdown-content';
import { SceneWrapper } from '../three/scene-wrapper';
import { TopicVisual } from '../three/topic-visual';
import { getAdjacentTopics } from '../../lib/topics';

interface TopicPageProps {
  slug: string;
  topic: Topic;
  metadata: TopicMetadata;
  onNavigateHome: () => void;
  onNavigateTopic: (slug: string) => void;
}

export function TopicPage({
  slug,
  topic,
  metadata,
  onNavigateHome,
  onNavigateTopic,
}: TopicPageProps) {
  const { heading, subheading, items, content } = topic;
  const { prev, next } = getAdjacentTopics(slug);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer"
        >
          Topics
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-xs">
          {heading}
        </span>
      </nav>

      {/* 2 & 3. Header Hero with 3D Visual */}
      <header className="relative rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-indigo-950/20 p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Topic Module</span>
            </div>

            {/* Topic Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight">
              {heading}
            </h1>

            {/* Optional Subheading (rendered only if present) */}
            {subheading && (
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                {subheading}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                {items.length} {items.length === 1 ? 'Question Card' : 'Question Cards'}
              </span>
              {content && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Markdown Study Notes
                </span>
              )}
            </div>
          </div>

          {/* 3D Topic Visual */}
          <div className="md:col-span-5 flex flex-col justify-center items-center">
            <SceneWrapper
              className="w-full max-w-[280px] h-[200px]"
              minHeight="200px"
              fallback={
                <div className="w-full h-[200px] flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-center p-4">
                    <span className="text-3xl font-black tracking-tight">{heading.slice(0, 2).toUpperCase()}</span>
                    <p className="text-xs text-neutral-500 mt-1 font-medium">{heading}</p>
                  </div>
                </div>
              }
            >
              <TopicVisual slug={slug} heading={heading} />
            </SceneWrapper>
            <div className="text-[11px] text-center text-neutral-400 dark:text-neutral-500 font-medium select-none flex items-center gap-1 mt-1">
              <span>Drag to rotate • Click shapes to spin</span>
            </div>
          </div>
        </div>
      </header>

      {/* 4 & 5. Interactive Question-and-Answer Cards */}
      <main>
        <QuestionList items={items} topicHeading={heading} />

        {/* 6. Optional Markdown Content Section (Rendered strictly AFTER the Q&A section) */}
        {content && content.trim().length > 0 && (
          <MarkdownContent content={content} topicHeading={heading} />
        )}
      </main>

      {/* 7. Related / Next Topic Navigation */}
      <footer className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <button
              type="button"
              onClick={() => onNavigateTopic(prev.slug)}
              className="group flex flex-col p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-1">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Previous Topic
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {prev.heading}
              </span>
            </button>
          ) : (
            <div />
          )}

          {next && (
            <button
              type="button"
              onClick={() => onNavigateTopic(next.slug)}
              className="group flex flex-col p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-right items-end cursor-pointer sm:col-start-2"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 mb-1">
                Next Topic
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {next.heading}
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

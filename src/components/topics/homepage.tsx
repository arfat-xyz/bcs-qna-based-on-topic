import React, { useState, useMemo } from 'react';
import { ArrowRight, BookOpen, Sparkles, HelpCircle, FileText, Compass, Search, FileJson } from 'lucide-react';
import type { TopicMetadata } from '../../types/topic';
import { TopicCard } from './topic-card';
import { SearchInput } from '../ui/search-input';
import { EmptyState } from '../ui/empty-state';
import { SceneWrapper } from '../three/scene-wrapper';
import { BackgroundScene } from '../three/background-scene';
import { JsonSkeletonModal } from '../ui/json-skeleton-modal';

interface HomepageProps {
  topics: { slug: string; metadata: TopicMetadata }[];
  onSelectTopic: (slug: string) => void;
}

export function Homepage({ topics, onSelectTopic }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSkeletonModalOpen, setIsSkeletonModalOpen] = useState(false);

  // Filter topics dynamically based on heading & subheading
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase().trim();
    return topics.filter(({ metadata }) => {
      const hMatch = metadata.heading.toLowerCase().includes(query);
      const sMatch = metadata.subheading?.toLowerCase().includes(query);
      const slugMatch = metadata.slug.toLowerCase().includes(query);
      return hMatch || sMatch || slugMatch;
    });
  }, [topics, searchQuery]);

  // Aggregate statistics across discovered JSONs
  const totalQuestions = useMemo(() => {
    return topics.reduce((acc, t) => acc + t.metadata.questionCount, 0);
  }, [topics]);

  const totalWithNotes = useMemo(() => {
    return topics.filter((t) => t.metadata.hasMarkdownContent).length;
  }, [topics]);

  const handleStartStudying = () => {
    if (topics.length > 0) {
      onSelectTopic(topics[0].slug);
    }
  };

  const handleExploreScroll = () => {
    const el = document.getElementById('topics-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-8 sm:pb-14 lg:pt-12 lg:pb-20 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>JSON-Driven Modular Study Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight leading-[1.12] sm:leading-[1.08] break-words">
                Learn Smarter, One Question at a Time.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                Master English grammar, idioms, computer science, and general knowledge with interactive eye-reveal study cards and deep-dive markdown revision guides.
              </p>

              {/* Action Buttons: Responsive full width on mobile, inline on tablet & desktop */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExploreScroll}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Topics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSkeletonModalOpen(true)}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-sm sm:text-base border border-neutral-200/80 dark:border-neutral-700 transition-all flex items-center gap-2 active:scale-98 cursor-pointer shadow-xs group"
                >
                  <FileJson className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span>JSON Skeletons</span>
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="pt-5 sm:pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 grid grid-cols-3 gap-2 sm:gap-4 max-w-md">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                    {topics.length}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                    Topic Modules
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {totalQuestions}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                    Study Questions
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                    {totalWithNotes}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                    Revision Notes
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center w-full mt-2 lg:mt-0">
              {/* Atmospheric Spatial Glow behind the Holographic Core */}
              <div
                className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none dark:opacity-90 opacity-60"
                aria-hidden="true"
              />
              <SceneWrapper className="w-full h-[300px] sm:h-[380px] md:h-[440px] lg:h-[500px]">
                <BackgroundScene />
              </SceneWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Discovered Topic Listing Section */}
      <section
        id="topics-section"
        aria-labelledby="topics-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
              <span>Dynamic JSON Index</span>
            </div>
            <h2
              id="topics-heading"
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight"
            >
              Browse Educational Topics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select any topic to start testing your knowledge with hidden answer cards.
            </p>
          </div>

          {/* Search Control */}
          <div className="w-full md:w-80 shrink-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter topics by title..."
            />
          </div>
        </div>

        {/* Content State: Topics List or Empty State */}
        {topics.length === 0 ? (
          <EmptyState type="no-topics" />
        ) : filteredTopics.length === 0 ? (
          <EmptyState
            type="search-empty"
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTopics.map(({ slug, metadata }) => (
              <TopicCard
                key={slug}
                metadata={metadata}
                onClick={onSelectTopic}
              />
            ))}
          </div>
        )}
      </section>

      {/* JSON Skeleton & Schema Documentation Modal */}
      <JsonSkeletonModal
        isOpen={isSkeletonModalOpen}
        onClose={() => setIsSkeletonModalOpen(false)}
      />
    </div>
  );
}

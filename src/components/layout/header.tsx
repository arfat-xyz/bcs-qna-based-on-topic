import React, { useState } from 'react';
import { BookOpen, Moon, Sun, Menu, X, Sparkles, Layers } from 'lucide-react';
import { useTheme } from '../../lib/theme-context';
import type { TopicMetadata } from '../../types/topic';

interface HeaderProps {
  topics: { slug: string; metadata: TopicMetadata }[];
  currentSlug: string | null;
  onNavigateHome: () => void;
  onNavigateTopic: (slug: string) => void;
}

export function Header({
  topics,
  currentSlug,
  onNavigateHome,
  onNavigateTopic,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-neutral-950/85 border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-neutral-950 dark:text-white flex items-center gap-1.5">
                Cognition
                <span className="text-[10px] font-bold px-1.5 py-0.2 uppercase tracking-wider rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  JSON Study
                </span>
              </span>
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Interactive Learning Modules
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentSlug === null
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              Overview
            </button>

            {/* Topics Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  currentSlug !== null
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Topics ({topics.length})</span>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                    Discovered Modules
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                    {topics.map(({ slug, metadata }) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          onNavigateTopic(slug);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          currentSlug === slug
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="truncate">{metadata.heading}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold shrink-0">
                          {metadata.questionCount}Q
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-900">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Navigation</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              currentSlug === null
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            All Topics & Overview
          </button>

          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-4 mb-1">
              Topics ({topics.length})
            </div>
            <div className="space-y-1">
              {topics.map(({ slug, metadata }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    onNavigateTopic(slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                    currentSlug === slug
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span>{metadata.heading}</span>
                  <span className="text-xs text-neutral-400">
                    {metadata.questionCount} Qs
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

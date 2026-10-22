import React from 'react';
import { BookOpen, Sparkles, Code2, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';
import type { TopicMetadata } from '../../types/topic';
import { PORTFOLIO_METADATA } from '../../lib/portfolio-metadata';

interface FooterProps {
  topics: { slug: string; metadata: TopicMetadata }[];
  onNavigateTopic: (slug: string) => void;
  onNavigateHome: () => void;
}

export function Footer({ topics, onNavigateTopic, onNavigateHome }: FooterProps) {
  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 lg:mt-24 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pb-8 border-b border-neutral-200/60 dark:border-neutral-800/60">
          {/* Brand & Author Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white">
                Cognition Platform
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              A modern, JSON-driven educational application. Every topic is a separate validated JSON document rendered with interactive Q&A cards and Three.js spatial visuals.
            </p>

            {/* Creator / Portfolio Link Badge */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Created & Engineered By
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={PORTFOLIO_METADATA.siteUrl}
                  target="_blank"
                  rel="author noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  <img
                    src="/img/me.webp"
                    alt={PORTFOLIO_METADATA.authorName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-400/60"
                  />
                  <span>{PORTFOLIO_METADATA.authorName}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={PORTFOLIO_METADATA.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>

                <a
                  href={PORTFOLIO_METADATA.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#0A66C2] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Topics */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Discovered Topics ({topics.length})
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              {topics.slice(0, 8).map(({ slug, metadata }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onNavigateTopic(slug)}
                  className="text-left text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 truncate cursor-pointer transition-colors"
                >
                  {metadata.heading}
                </button>
              ))}
            </div>
          </div>

          {/* How to add topics note */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              Dynamic JSON Discovery
            </h4>
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 font-mono">
              <p className="text-[11px] font-sans text-neutral-700 dark:text-neutral-300">
                To add a topic, create a JSON file:
              </p>
              <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                src/data/topics/&lt;slug&gt;.json
              </div>
              <p className="text-[10px] font-sans text-neutral-500">
                Auto-registered without code changes.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} Cognition Educational Platform. Developed by{' '}
            <a
              href={PORTFOLIO_METADATA.siteUrl}
              target="_blank"
              rel="author noopener noreferrer"
              className="font-medium text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2"
            >
              {PORTFOLIO_METADATA.authorName}
            </a>
            .
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Three.js Accelerated
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span>Accessibility Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './lib/theme-context';
import { getValidTopics, getTopicBySlug } from './lib/topics';
import { PORTFOLIO_METADATA, getAuthorPersonSchema } from './lib/portfolio-metadata';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/footer';
import { Homepage } from './components/topics/homepage';
import { TopicPage } from './components/topics/topic-page';
import { NotFound } from './components/ui/not-found';

/**
 * Extracts the topic slug from the current browser location (pathname or hash).
 */
function parseCurrentSlug(): string | null {
  if (typeof window === 'undefined') return null;

  // Check hash route first (e.g. #/topics/preposition)
  const hash = window.location.hash;
  if (hash.startsWith('#/topics/')) {
    const raw = hash.replace('#/topics/', '').split('?')[0].split('/')[0];
    return raw ? decodeURIComponent(raw) : null;
  }

  // Check path route (e.g. /topics/preposition)
  const path = window.location.pathname;
  if (path.startsWith('/topics/')) {
    const raw = path.replace('/topics/', '').split('?')[0].split('/')[0];
    return raw ? decodeURIComponent(raw) : null;
  }

  return null;
}

export default function App() {
  const [validTopics, setValidTopics] = useState(() => getValidTopics());
  const [currentSlug, setCurrentSlug] = useState<string | null>(parseCurrentSlug);

  // Sync with browser URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentSlug(parseCurrentSlug());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Update dynamic page title & SEO metadata whenever slug changes
  useEffect(() => {
    const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (!currentSlug) {
      document.title = 'Cognition - Interactive JSON Study Platform | Arfatur Rahman';
      const homeDesc =
        'A modern, interactive educational platform with dynamic JSON topic loading, expandable Q&A study cards, markdown revision notes, and immersive 3D visualizations. Built by Arfatur Rahman.';
      const ogImg = `${window.location.origin}/og-image.jpg`;
      updateMeta('description', homeDesc);
      updateMeta('og:title', 'Cognition - Interactive JSON Study Platform | Arfatur Rahman', true);
      updateMeta('og:description', homeDesc, true);
      updateMeta('og:image', ogImg, true);
      updateMeta('twitter:title', 'Cognition - Interactive JSON Study Platform | Arfatur Rahman');
      updateMeta('twitter:description', homeDesc);
      updateMeta('twitter:image', ogImg);
      return;
    }

    const currentTopicData = getTopicBySlug(currentSlug);
    if (currentTopicData) {
      const heading = currentTopicData.topic.heading;
      const subheading = currentTopicData.topic.subheading || 'Interactive study notes and question cards.';
      const pageTitle = `${heading} | Cognition Study Platform (by Arfatur Rahman)`;
      const pageDesc = `${subheading} - Study questions and answers. Engineered by Arfatur Rahman.`;
      const ogImg = `${window.location.origin}/og-image.jpg`;

      document.title = pageTitle;
      updateMeta('description', pageDesc);
      updateMeta('og:title', pageTitle, true);
      updateMeta('og:description', pageDesc, true);
      updateMeta('og:image', ogImg, true);
      updateMeta('twitter:title', pageTitle);
      updateMeta('twitter:description', pageDesc);
      updateMeta('twitter:image', ogImg);

      // Add educational structured data (Schema.org) with Author and Portfolio attribution
      let scriptTag = document.getElementById('cognition-schema') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'cognition-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: heading,
        description: subheading,
        author: getAuthorPersonSchema(),
        publisher: {
          '@type': 'Person',
          name: PORTFOLIO_METADATA.authorName,
          url: PORTFOLIO_METADATA.siteUrl,
        },
        provider: {
          '@type': 'Organization',
          name: 'Cognition Study Platform',
          url: PORTFOLIO_METADATA.siteUrl,
        },
        hasPart: currentTopicData.topic.items.map((item, idx) => ({
          '@type': 'Question',
          name: `Question ${idx + 1}`,
          text: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    } else {
      document.title = 'Topic Not Found | Cognition Study Platform';
    }
  }, [currentSlug]);

  const navigateToHome = useCallback(() => {
    setCurrentSlug(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToTopic = useCallback((slug: string) => {
    setCurrentSlug(slug);
    // Clear any leftover ?page= param when switching topics
    window.history.pushState(null, '', `/topics/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Lookup topic if slug is selected
  const activeTopic = currentSlug ? getTopicBySlug(currentSlug) : null;
  const isNotFound = currentSlug !== null && activeTopic === null;

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-600">
        <Header
          topics={validTopics}
          currentSlug={currentSlug}
          onNavigateHome={navigateToHome}
          onNavigateTopic={navigateToTopic}
        />

        <div className="flex-1">
          {isNotFound ? (
            <NotFound
              invalidSlug={currentSlug!}
              availableTopics={validTopics}
              onNavigateHome={navigateToHome}
              onNavigateTopic={navigateToTopic}
            />
          ) : activeTopic ? (
            <TopicPage
              slug={activeTopic.slug}
              topic={activeTopic.topic}
              metadata={activeTopic.metadata}
              onNavigateHome={navigateToHome}
              onNavigateTopic={navigateToTopic}
            />
          ) : (
            <Homepage
              topics={validTopics}
              onSelectTopic={navigateToTopic}
            />
          )}
        </div>

        <Footer
          topics={validTopics}
          onNavigateTopic={navigateToTopic}
          onNavigateHome={navigateToHome}
        />
      </div>
    </ThemeProvider>
  );
}

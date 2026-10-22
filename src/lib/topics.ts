import type { Topic, TopicMetadata, TopicFileResult } from '../types/topic';
import { validateTopicData } from './topic-schema';

// Automatically discover and load all JSON files from src/data/topics
const topicModules = import.meta.glob('/src/data/topics/*.json', {
  eager: true,
}) as Record<string, { default?: unknown } | unknown>;

/**
 * Extracts the slug identifier from a file path.
 * e.g. "/src/data/topics/parts-of-speech.json" -> "parts-of-speech"
 */
export function extractSlugFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return fileName.replace(/\.json$/i, '');
}

/**
 * Sanitizes and validates a requested slug to prevent path traversal or invalid characters.
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Loads and validates all available topics dynamically.
 */
export function getAllDiscoveredTopics(): TopicFileResult[] {
  const results: TopicFileResult[] = [];

  for (const [filePath, rawModule] of Object.entries(topicModules)) {
    const slug = extractSlugFromPath(filePath);
    // Vite eager import may expose the JSON directly or under .default
    const rawData =
      rawModule && typeof rawModule === 'object' && 'default' in rawModule
        ? (rawModule as { default: unknown }).default
        : rawModule;

    const validation = validateTopicData(rawData);

    if (validation.success && validation.topic) {
      const topic = validation.topic;
      const metadata: TopicMetadata = {
        slug,
        heading: topic.heading,
        subheading: topic.subheading,
        questionCount: Array.isArray(topic.items) ? topic.items.length : 0,
        hasMarkdownContent: Boolean(topic.content && topic.content.trim().length > 0),
      };

      results.push({
        slug,
        topic,
        metadata,
        isValid: true,
      });
    } else {
      results.push({
        slug,
        isValid: false,
        error: validation.error || 'Failed schema validation',
      });
    }
  }

  // Sort topics alphabetically by heading
  return results.sort((a, b) => {
    const headingA = a.topic?.heading || a.slug;
    const headingB = b.topic?.heading || b.slug;
    return headingA.localeCompare(headingB);
  });
}

/**
 * Returns only the valid topics for display and navigation.
 */
export function getValidTopics(): { slug: string; topic: Topic; metadata: TopicMetadata }[] {
  return getAllDiscoveredTopics()
    .filter((res): res is TopicFileResult & { topic: Topic; metadata: TopicMetadata } =>
      Boolean(res.isValid && res.topic && res.metadata)
    )
    .map((res) => ({
      slug: res.slug,
      topic: res.topic,
      metadata: res.metadata,
    }));
}

/**
 * Returns a list of all valid slugs.
 */
export function getAllTopicSlugs(): string[] {
  return getValidTopics().map((t) => t.slug);
}

/**
 * Finds a topic by its slug.
 */
export function getTopicBySlug(
  requestedSlug: string
): { slug: string; topic: Topic; metadata: TopicMetadata } | null {
  const cleanSlug = sanitizeSlug(requestedSlug);
  const found = getValidTopics().find((item) => item.slug === cleanSlug);
  return found || null;
}

/**
 * Finds adjacent topics (previous and next) for sequential studying.
 */
export function getAdjacentTopics(currentSlug: string): {
  prev: { slug: string; heading: string } | null;
  next: { slug: string; heading: string } | null;
} {
  const list = getValidTopics();
  const index = list.findIndex((item) => item.slug === currentSlug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  const prev = index > 0 ? { slug: list[index - 1].slug, heading: list[index - 1].topic.heading } : null;
  const next =
    index < list.length - 1
      ? { slug: list[index + 1].slug, heading: list[index + 1].topic.heading }
      : null;

  return { prev, next };
}

/**
 * Returns formatted JSON code strings and metadata for every discovered topic file.
 */
export function getAllRawTopicJSONs(): { slug: string; heading: string; jsonString: string }[] {
  const list: { slug: string; heading: string; jsonString: string }[] = [];

  for (const [filePath, rawModule] of Object.entries(topicModules)) {
    const slug = extractSlugFromPath(filePath);
    const rawData =
      rawModule && typeof rawModule === 'object' && 'default' in rawModule
        ? (rawModule as { default: unknown }).default
        : rawModule;

    let heading = slug;
    if (rawData && typeof rawData === 'object' && 'heading' in rawData && typeof (rawData as Record<string, unknown>).heading === 'string') {
      heading = (rawData as Record<string, unknown>).heading as string;
    }

    list.push({
      slug,
      heading,
      jsonString: JSON.stringify(rawData, null, 2),
    });
  }

  return list.sort((a, b) => a.heading.localeCompare(b.heading));
}

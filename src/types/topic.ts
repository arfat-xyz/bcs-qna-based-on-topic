/**
 * Topic data structures and types for the Cognition platform.
 */

export interface QuestionItem {
  question: string;
  answer: string;
}

export interface Topic {
  heading: string;
  subheading?: string;
  items: QuestionItem[];
  content?: string;
}

export interface TopicMetadata {
  slug: string;
  heading: string;
  subheading?: string;
  questionCount: number;
  hasMarkdownContent: boolean;
  category?: string;
  readTimeMinutes?: number;
}

export interface TopicFileResult {
  slug: string;
  topic?: Topic;
  metadata?: TopicMetadata;
  isValid: boolean;
  error?: string;
}

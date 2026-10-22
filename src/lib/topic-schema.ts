import { z } from 'zod';
import type { Topic } from '../types/topic';

export const QuestionItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, { message: 'Question cannot be empty' }),
  answer: z
    .string()
    .trim()
    .min(1, { message: 'Answer cannot be empty' }),
});

export const TopicSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, { message: 'Heading is required and cannot be empty' }),
  subheading: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  items: z
    .array(QuestionItemSchema)
    .default([]),
  content: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
});

/**
 * Validates a parsed JSON object against the Topic schema.
 */
export function validateTopicData(data: unknown): {
  success: boolean;
  topic?: Topic;
  error?: string;
} {
  const result = TopicSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    return {
      success: false,
      error: issues,
    };
  }
  return {
    success: true,
    topic: result.data,
  };
}

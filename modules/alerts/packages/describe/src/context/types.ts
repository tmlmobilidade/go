/* * */

/**
 * The allowed steps for the prompt context.
 */
export type PromptContextBlock =
  | 'body'
  | 'data'
  | 'footer'
  | 'header';

/**
 * The prompt context type.
 */
export type PromptContext = Record<PromptContextBlock, string[]>;

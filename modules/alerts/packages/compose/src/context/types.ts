/* * */

/**
 * The allowed steps for the prompt context.
 */
export type PromptContextBlock =
  | 'data'
  | 'intro'
  | 'references'
  | 'user_instructions';

/**
 * The prompt context type.
 */
export type PromptContext = Record<PromptContextBlock, string[]>;

/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

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
export type PromptContext = Record<I18nCode, Record<PromptContextBlock, string[]>>;

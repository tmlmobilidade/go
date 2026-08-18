/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

import { type PromptContext, type PromptContextBlock } from './types.js';

/**
 * Appends text to the given block of the prompt context for the given language.
 * @param context The prompt context.
 * @param i18n The language code.
 * @param block The block of the prompt context.
 * @param text The text to append.
 * @returns The prompt context.
 */
export function appendToPromptContext(context: PromptContext, i18n: I18nCode, block: PromptContextBlock, text: string): PromptContext {
	context[i18n][block].push(text);
	return context;
}

/**
 * Prepends text to the given block of the prompt context for the given language.
 * @param context The prompt context.
 * @param i18n The language code.
 * @param block The block of the prompt context.
 * @param text The text to prepend.
 * @returns The prompt context.
 */
export function prependToPromptContext(context: PromptContext, i18n: I18nCode, block: PromptContextBlock, text: string): PromptContext {
	context[i18n][block].unshift(text);
	return context;
}

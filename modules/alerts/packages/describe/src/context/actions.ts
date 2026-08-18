/* * */

import { type PromptContext, type PromptContextBlock } from './types.js';

/**
 * Appends text to the given block of the prompt context.
 * @param context The prompt context.
 * @param block The block of the prompt context.
 * @param text The text to append.
 * @returns The prompt context.
 */
export function appendToPromptContext(context: PromptContext, block: PromptContextBlock, text: string | string[]): PromptContext {
	if (Array.isArray(text)) text.forEach(item => context[block].push(item));
	else context[block].push(text);
	return context;
}

/**
 * Prepends text to the given block of the prompt context.
 * @param context The prompt context.
 * @param block The block of the prompt context.
 * @param text The text to prepend.
 * @returns The prompt context.
 */
export function prependToPromptContext(context: PromptContext, block: PromptContextBlock, text: string | string[]): PromptContext {
	if (Array.isArray(text)) text.forEach(item => context[block].unshift(item));
	else context[block].unshift(text);
	return context;
}

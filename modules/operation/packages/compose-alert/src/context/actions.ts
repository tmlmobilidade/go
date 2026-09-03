/* * */

import { type PromptContext } from './types.js';

/**
 * Appends text to the given block of the prompt context.
 * @param context The prompt context.
 * @param block The block of the prompt context.
 * @param text The text to append.
 * @returns The prompt context.
 */
export function addToPromptContext(context: PromptContext, text: string | string[]): PromptContext {
	if (Array.isArray(text)) text.forEach(item => context.push(item));
	else context.push(text);
	return context;
}

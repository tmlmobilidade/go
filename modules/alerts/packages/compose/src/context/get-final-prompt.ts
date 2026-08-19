/* * */

import { type PromptContext } from './types.js';

/**
 * Gets the final prompt for the given language from the context.
 * @param context The prompt context.
 * @returns The final prompt for the given language.
 */
export function getFinalPrompt(context: PromptContext): string {
	return context
		.join('\n')
		.replace(/\n+/g, '\n') // Remove duplicate newlines
		.replace(/[ \t]+/g, ' ') // Remove duplicate spaces
		.trim();
}

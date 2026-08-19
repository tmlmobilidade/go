/* * */

import { type PromptContext } from './types.js';

/**
 * Gets the final prompt for the given language from the context.
 * @param context The prompt context.
 * @returns The final prompt for the given language.
 */
export function getFinalPrompt(context: PromptContext): string {
	//

	let finalPrompt: string = '';

	finalPrompt += context.intro.join('\n');

	finalPrompt += context.references.join('\n');

	finalPrompt += context.data.join('\n');

	finalPrompt += context.user_instructions.join('\n');

	return finalPrompt
		.replace(/\n+/g, '\n') // Remove duplicate newlines
		.replace(/[ \t]+/g, ' ') // Remove duplicate spaces
		.trim();
}

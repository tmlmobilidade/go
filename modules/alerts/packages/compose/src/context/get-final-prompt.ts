/* * */

import { type PromptContext } from './types.js';

/**
 * Gets the final prompt for the given language from the context.
 * @param context The prompt context.
 * @returns The final prompt for the given language.
 */
export function getFinalPrompt(context: PromptContext): string {
	//

	let finalPrompt: string;

	finalPrompt = context.header.join('\n');

	finalPrompt += context.body.join('\n');

	finalPrompt += context.footer.join('\n');

	return finalPrompt;
}

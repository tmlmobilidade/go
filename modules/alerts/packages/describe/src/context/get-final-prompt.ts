/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

import { type PromptContext } from './types.js';

/**
 * Gets the final prompt for the given language from the context.
 * @param context The prompt context.
 * @param i18n The language code.
 * @returns The final prompt for the given language.
 */
export function getFinalPrompt(context: PromptContext, i18n: I18nCode): string {
	//

	let finalPrompt: string;

	finalPrompt = context.context[i18n].init.join('\n');

	finalPrompt += context.context[i18n].body.join('\n');

	finalPrompt += context.context[i18n].footer.join('\n');

	return finalPrompt;
}

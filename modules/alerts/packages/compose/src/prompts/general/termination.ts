/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Initial part of the prompt for generating title and description together.
 */
export const terminationPrompt: Record<I18nCode, string> = {
	en: `
		Generate the requested JSON object now.
	`,
	pt: `
		Gera agora o objeto JSON solicitado.
	`,
};

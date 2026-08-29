/* * */

import { type LanguageTag } from '@tmlmobilidade/go-types-shared';

/**
 * Initial part of the prompt for generating title and description together.
 */
export const terminationPrompt: Record<LanguageTag, string> = {
	en: 'Generate the requested JSON object now.',
	es: 'Genera ahora el objeto JSON solicitado.',
	pt: 'Gera agora o objeto JSON solicitado.',
};

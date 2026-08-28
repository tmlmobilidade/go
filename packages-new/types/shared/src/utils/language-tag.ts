/* * */

import { z } from 'zod';

/* * */

export const LanguageTagValues = [
	'pt',
	'es',
	'en',
] as const;

export const LanguageTagSchema = z.enum(LanguageTagValues);

/**
 * A language tag as defined by the IANA language subtag registry.
 * @see https://www.w3.org/International/articles/language-tags
 */
export type LanguageTag = z.infer<typeof LanguageTagSchema>;

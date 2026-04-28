/* * */

import { z } from 'zod';

/* * */

export const I18nCodes = [
	'en',
	'es',
	'pt',
] as const;

export const I18nCodeSchema = z.enum(I18nCodes);

export type I18nCode = z.infer<typeof I18nCodeSchema>;

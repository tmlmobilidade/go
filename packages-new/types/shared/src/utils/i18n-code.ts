/* * */

import { z } from 'zod';

/* * */

export const I18nCodeValues = [
	'en',
	// 'es',
	'pt',
] as const;

export const I18nCodeSchema = z.enum(I18nCodeValues);

export type I18nCode = z.infer<typeof I18nCodeSchema>;

/* * */

import { z } from 'zod';

/* * */

export const ThemeModeValues = [
	'light',
	'dark',
] as const;

export const ThemeModeSchema = z.enum(ThemeModeValues);

export type ThemeMode = z.infer<typeof ThemeModeSchema>;

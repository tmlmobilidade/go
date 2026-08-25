/* * */

import { z } from 'zod';

/* * */

export const ThemeModeValues = [
	'light',
	'dark',
] as const;

export const ThemeModeSchema = z.enum(ThemeModeValues);

export type ThemeMode = z.infer<typeof ThemeModeSchema>;

/* * */

export const ThemeModePreferenceValues = [
	...ThemeModeValues,
	'system',
] as const;

export const ThemeModePreferenceSchema = z.enum(ThemeModePreferenceValues);

export type ThemeModePreference = z.infer<typeof ThemeModePreferenceSchema>;

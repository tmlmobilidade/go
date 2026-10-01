/* * */

import { z } from 'zod';

/* * */

export const ThemeSchemeValues = [
	'park',
	'ocean',
	// ...
] as const;

export const ThemeSchemeSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ThemeSchemeValues));

export type ThemeScheme = z.infer<typeof ThemeSchemeSchema>;

/* * */

import { z } from 'zod';

/* * */

export const SEVERITY_LEVELS = [
	'error',
	'warning',
	'ignore',
	'forbidden',
] as const;

export const SeverityLevelSchema = z.enum(SEVERITY_LEVELS);

export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

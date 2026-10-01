/* * */

import { z } from 'zod';

/* * */

export const MePreferencesPlatformRequestSchema = z.object({
	key: z.string(),
	scope: z.string(),
	value: z.any(),
});

/**
 * The request schema for updating user preferences
 * for a given scope.
 */
export type MePreferencesPlatformRequest = z.infer<typeof MePreferencesPlatformRequestSchema>;

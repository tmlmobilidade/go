/* * */

import { ThemeModeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SidebarLogoPlatformRequestSchema = z.object({
	theme_mode: ThemeModeSchema,
});

/**
 * The request schema for getting sidebar logo platform data
 * for a given scope.
 */
export type SidebarLogoPlatformRequest = z.infer<typeof SidebarLogoPlatformRequestSchema>;

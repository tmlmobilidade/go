/* * */

import { z } from 'zod';

/* * */

export const SidebarLogoPlatformResponseSchema = z.string();

/**
 * A read model for the sidebar logo platform response.
 */
export type SidebarLogoPlatformResponse = z.infer<typeof SidebarLogoPlatformResponseSchema>;

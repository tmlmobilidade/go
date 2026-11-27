/* * */

import { z } from 'zod';

/* * */

export const UsersCreateItemResponseSchema = z.object({
	user_id: z.string(),
});

/**
 * The response schema sent by the API after creating a user.
 */
export type UsersCreateItemResponse = z.infer<typeof UsersCreateItemResponseSchema>;

/* * */

import { z } from 'zod';

import { UsersDetailItemResponseSchema } from '../detail/users-detail-item-response.js';

/* * */

export const UsersUpdateItemResponseSchema = UsersDetailItemResponseSchema;

/**
 * The response schema sent by the API after updating a user.
 */
export type UsersUpdateItemResponse = z.infer<typeof UsersUpdateItemResponseSchema>;

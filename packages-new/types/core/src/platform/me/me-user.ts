/* * */

import { UserSchema } from '@/users/user.js';
import { z } from 'zod';

/* * */

export const MeUserSchema = UserSchema
	.pick({
		_id: true,
		created_at: true,
		dismissed_banners: true,
		email: true,
		first_name: true,
		last_name: true,
		organization_id: true,
		phone: true,
		preferences: true,
		seen_changelogs: true,
		seen_last_at: true,
	});

/**
 * The MeUser object contains the required information
 * about the current user that is logged in the platform.
 */
export type MeUser = z.infer<typeof MeUserSchema>;

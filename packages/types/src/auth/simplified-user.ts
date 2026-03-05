/* * */

import { UserSchema } from '@/auth/user.js';
import { z } from 'zod';

/* * */

export const SimplifiedUserSchema = UserSchema
	.pick({
		_id: true,
		first_name: true,
		last_name: true,
		organization_id: true,
		seen_last_at: true,
	})
	.extend({
		organization_name: z.string(),
	});

export type SimplifiedUser = z.infer<typeof SimplifiedUserSchema>;

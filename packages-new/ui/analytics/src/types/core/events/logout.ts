/* * */

import { z } from 'zod';

/* * */

export const LogoutEvent = z.object({
	title: z.literal('go-core-frontend-Logout'),
});

/* * */

export type LogoutEvent = z.infer<typeof LogoutEvent>;

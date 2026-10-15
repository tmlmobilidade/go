/* * */

import { z } from 'zod';

/* * */

export const LoginEvent = z.object({
	title: z.literal('go-core-frontend-login'),
});

/* * */

export type LoginEvent = z.infer<typeof LoginEvent>;

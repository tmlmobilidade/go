/* * */

import { z } from 'zod';

/* * */

export const LoginOpenedEvent = z.object({
	title: z.literal('go-core-frontend-login-opened'),
});

/* * */

export type LoginOpenedEvent = z.infer<typeof LoginOpenedEvent>;

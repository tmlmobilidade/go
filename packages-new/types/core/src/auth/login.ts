/* * */

import { z } from 'zod';

/* * */

export const LoginDtoSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

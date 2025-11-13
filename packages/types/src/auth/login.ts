/* * */

import { z } from 'zod';

/* * */

export const LoginDtoSchema = z.object({
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Email must be a valid email address' }),
	password: z.string({ required_error: 'Password is required' }),
}).strict();

export type LoginDto = z.infer<typeof LoginDtoSchema>;

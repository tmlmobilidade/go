/* * */

import { z } from 'zod';

/* * */

export const HttpStatusValues = [
	'200', // OK
	'201', // Created
	'204', // No Content
	'400', // Bad Request
	'401', // Unauthorized
	'403', // Forbidden
	'404', // Not Found
	'500', // Internal Server Error
] as const;

export const HttpStatusSchema = z.enum(HttpStatusValues);

export type HttpStatus = z.infer<typeof HttpStatusSchema>;

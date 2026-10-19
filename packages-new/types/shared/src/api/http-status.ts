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
	'415', // Unsupported Media Type
	'429', // Too Many Requests
	'500', // Internal Server Error
	'502', // Bad Gateway
	'503', // Service Unavailable
	'504', // Gateway Timeout
] as const;

export const HttpStatusSchema = z.enum(HttpStatusValues);

export type HttpStatus = z.infer<typeof HttpStatusSchema>;

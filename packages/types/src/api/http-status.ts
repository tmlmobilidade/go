/* * */

import { z } from 'zod';

/* * */

export const HttpStatusValues = [
	'200 - OK',
	'201 - Created',
	'204 - No Content',
	'400 - Bad Request',
	'401 - Unauthorized',
	'403 - Forbidden',
	'404 - Not Found',
	'500 - Internal Server Error',
] as const;

export const HttpStatusSchema = z.enum(HttpStatusValues);

export type HttpStatus = z.infer<typeof HttpStatusSchema>;

/**
 * Mapping from HttpStatus to their corresponding HTTP codes.
 * This mapping is used to convert extended HTTP status descriptions
 * to their corresponding standard HTTP codes.
 */
export const HttpStatusToHttpCodesMap: Record<HttpStatus, number> = {
	'200 - OK': 200,
	'201 - Created': 201,
	'204 - No Content': 204,
	'400 - Bad Request': 400,
	'401 - Unauthorized': 401,
	'403 - Forbidden': 403,
	'404 - Not Found': 404,
	'500 - Internal Server Error': 500,
};

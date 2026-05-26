/* * */

import { HttpStatusSchema } from '@/api/http-status.js';
import { z } from 'zod';

/* * */

export const ApiResponseSuccessSchema = z.object({
	data: z.any(),
	error: z.null(),
	status_code: HttpStatusSchema.extract([
		'200', // OK
		'201', // Created
		'204', // No Content
	]),
});

export type ApiResponseSuccess<T> = Omit<z.infer<typeof ApiResponseSuccessSchema>, 'data'> & { data: T };

/* * */

export const ApiResponseErrorSchema = z.object({
	data: z.null(),
	error: z.string(),
	status_code: HttpStatusSchema.extract([
		'400', // Bad Request
		'401', // Unauthorized
		'403', // Forbidden
		'404', // Not Found
		'500', // Internal Server Error
	]),
});

export type ApiResponseError = z.infer<typeof ApiResponseErrorSchema>;

/* * */

export const ApiResponseSchema = z.discriminatedUnion('status_code', [ApiResponseSuccessSchema, ApiResponseErrorSchema]);

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>;

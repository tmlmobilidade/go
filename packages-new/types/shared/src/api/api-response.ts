/* * */

import { z } from 'zod';

import { UnixMillisecondsSchema } from '../datetime/unix-millis.js';
import { HttpStatusSchema } from './http-status.js';

/* * */

export const ApiResponseSuccessSchema = z.object({
	data: z.unknown(),
	error: z.null(),
	generated_at: UnixMillisecondsSchema.nullable().default(null),
	status_code: HttpStatusSchema.extract([
		'200', // OK
		'201', // Created
		'204', // No Content
	]),
	timestamp: UnixMillisecondsSchema,
});

export type ApiResponseSuccess<T> = Omit<z.infer<typeof ApiResponseSuccessSchema>, 'data'> & { data: T };

/* * */

/** Safe validation details; never contains submitted values or Zod internals. */
export const ApiValidationIssueSchema = z.object({
	code: z.string(),
	message: z.string(),
	path: z.array(z.union([z.string(), z.number()])),
});

export type ApiValidationIssue = z.infer<typeof ApiValidationIssueSchema>;

export const ApiResponseErrorSchema = z.object({
	data: z.null(),
	error: z.string(),
	issues: z.array(ApiValidationIssueSchema).optional(),
	status_code: HttpStatusSchema.extract([
		'400', // Bad Request
		'401', // Unauthorized
		'403', // Forbidden
		'404', // Not Found
		'405', // Method Not Allowed
		'408', // Request Timeout
		'409', // Conflict
		'413', // Payload Too Large
		'415', // Unsupported Media Type
		'422', // Unprocessable Content
		'429', // Too Many Requests
		'500', // Internal Server Error
		'502', // Bad Gateway
		'503', // Service Unavailable
		'504', // Gateway Timeout
	]),
	timestamp: UnixMillisecondsSchema,
});

export type ApiResponseError = z.infer<typeof ApiResponseErrorSchema>;

/* * */

export const ApiResponseSchema = z.discriminatedUnion('status_code', [ApiResponseSuccessSchema, ApiResponseErrorSchema]);

export type ApiResponse<T> = ApiResponseError | ApiResponseSuccess<T>;

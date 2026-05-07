/* * */

import { z } from 'zod';

/* * */

export const ApiResponseSuccessSchema = z.object({
	data: z.any(),
	error: z.null(),
	statusCode: z.number(),
});

export type ApiResponseSuccess = z.infer<typeof ApiResponseSuccessSchema>;

/* * */

export const ApiResponseErrorSchema = z.object({
	data: z.null(),
	error: z.string(),
	statusCode: z.number(),
});

export type ApiResponseError = z.infer<typeof ApiResponseErrorSchema>;

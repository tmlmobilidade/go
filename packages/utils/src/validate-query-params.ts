/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { z } from 'zod';

/* * */

/**
 * Validates the query params against the schema
 * @param queryParams - The query params to validate
 * @param schema - The schema to validate the query params against
 * @returns The validated query params
 */
export function validateQueryParams<T>(queryParams: unknown, schema: z.ZodTypeAny): T {
	//
	// Validate the query params
	const result = schema.safeParse(queryParams);

	if (!result.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, result.error.errors.map(error => error.message).join(', '));
	}

	return result.data;
}

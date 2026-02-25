import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { z } from 'zod';

export function validateQueryParams<T>(queryParams: unknown, schema: z.ZodTypeAny): T {
	const result = schema.safeParse(queryParams);

	if (!result.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, result.error.errors.map(error => error.message).join(', '));
	}

	return result.data;
}

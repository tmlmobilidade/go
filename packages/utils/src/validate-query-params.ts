import { HttpException, HttpStatus } from '@go/consts';
import { z } from 'zod';

export function validateQueryParams<T>(queryParams: unknown, schema: z.ZodTypeAny): T {
	const result = schema.safeParse(queryParams);

	if (!result.success) {
		throw new HttpException(HttpStatus.BAD_REQUEST, result.error.errors.map(error => error.message).join(', '));
	}

	return result.data;
}

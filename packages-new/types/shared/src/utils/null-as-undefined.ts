import { z } from 'zod';

export function nullAsUndefined<T extends z.ZodTypeAny>(schema: T) {
	return z.preprocess(
		value => value === null ? undefined : value,
		schema,
	);
}

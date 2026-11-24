import { z } from 'zod';

export function nullAsUndefined<T extends z.ZodType>(schema: T) {
	return z.preprocess(
		value => value === null ? undefined : value,
		schema,
	);
}

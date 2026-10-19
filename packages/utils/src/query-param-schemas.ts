/* * */

import { z } from 'zod';

/* * */

export type QueryParamTransform = 'array' | 'boolean' | 'optional';

/**
 * Parses a comma-separated query string into a trimmed string array.
 */
export function queryParamArrayString<T extends z.ZodTypeAny>(schema: T) {
	return z.preprocess(
		(val: unknown) => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
		schema,
	);
}

/**
 * Parses common truthy query string values into a boolean.
 */
export function queryParamBoolean(defaultValue?: boolean) {
	const schema = z.preprocess(
		(val: unknown) => val === 'true' || val === '1',
		z.boolean(),
	);

	return defaultValue === undefined ? schema : schema.default(defaultValue);
}

/**
 * Treats empty query string values as undefined before validating optional fields.
 */
export function queryParamOptional<T extends z.ZodTypeAny>(schema: T) {
	const innerSchema = schema instanceof z.ZodOptional ? schema.unwrap() : schema;

	return z.preprocess(
		(val: unknown) => val === '' || val === null ? undefined : val,
		innerSchema.optional(),
	);
}

function transformQueryParamField(schema: z.ZodTypeAny, transform?: QueryParamTransform): z.ZodTypeAny {
	switch (transform) {
		case 'array':
			return queryParamArrayString(schema);
		case 'boolean':
			return queryParamBoolean();
		case 'optional':
			return queryParamOptional(schema);
		default:
			return schema;
	}
}

/**
 * Builds a query-string Zod object schema from a filters shape and per-field transforms.
 * Use the inferred output type as the shared contract between API handlers and frontend callers.
 */
export function toQueryParamsSchema<T extends Record<string, z.ZodTypeAny>>(
	shape: T,
	transforms: Partial<Record<keyof T, QueryParamTransform>>,
) {
	const queryShape = Object.fromEntries(
		Object.entries(shape).map(([key, schema]) => [
			key,
			transformQueryParamField(schema, transforms[key as keyof T]),
		]),
	) as { [K in keyof T]: z.ZodTypeAny };

	return z.object(queryShape);
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';

/**
 * Convert an object to match a Zod schema's shape.
 * @param source - The source object to convert
 * @param template - The Zod schema to validate against
 * @returns The converted object containing only the fields defined in the schema
 * @throws {Error} If a required field is missing from the source object
 */
export function convertObject<T extends z.ZodObject<z.ZodRawShape>>(source: unknown, template: T): z.infer<T> {
	//

	const templateKeys = Object.keys(template.shape);
	const result: Record<any, unknown> = {};

	for (const key of templateKeys) {
		const fieldSchema = template.shape[key];
		const value = (source as Record<string, unknown>)[key];

		// Handle undefined/null values
		if (value === undefined || value === null) {
			if (!fieldSchema.nullish()) {
				throw new Error(`Required field "${key}" is missing in the source object`);
			}
			continue;
		}

		const parsedValue = fieldSchema.safeParse(value);
		if (!parsedValue.success) {
			throw new Error(
				`Invalid field type for "${key}" in the source object:\n> ${parsedValue.error.errors.map(error => error.message).join('\n')}`,
			);
		}

		// Add the value to result
		result[key] = value;
	}

	return result as z.infer<T>;
}

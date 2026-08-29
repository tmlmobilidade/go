/* * */

import { z } from 'zod';

/**
 * A schema for floats.
 * It coerces the value to a number.
 * @example
 * ```ts
 * const schema = FloatSchema.parse(1);
 * // => 1
 * const schema = FloatSchema.parse(-1);
 * // => throws an error
 * const schema = FloatSchema.parse('1');
 * // => 1
 * ```
 */
export const FloatSchema = z
	.union([z.string(), z.number()])
	.transform(value => Number(value));

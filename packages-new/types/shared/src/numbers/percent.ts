/* * */

import { z } from 'zod';

/**
 * A schema for percentages in the range 0-100,
 * It coerces the value to an integer.
 * @example
 * ```ts
 * const schema = PercentSchema.parse(50);
 * // => 50
 * const schema = PercentSchema.parse('50');
 * // => 50
 * const schema = PercentSchema.parse(50.1);
 * // => 50
 * const schema = PercentSchema.parse(101);
 * // => throws an error
 * const schema = PercentSchema.parse(-1);
 * // => throws an error
 * ```
 */
export const PercentSchema = z
	.union([z.string(), z.number()])
	.transform(value => Number(value))
	.pipe(z.number().int().min(0).max(100));

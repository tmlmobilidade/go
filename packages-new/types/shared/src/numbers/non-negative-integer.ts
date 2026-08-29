/* * */

import { z } from 'zod';

/**
 * A schema for non-negative integers.
 * It coerces the value to an integer and ensures it is non-negative.
 * @example
 * ```ts
 * const schema = NonNegativeIntegerSchema.parse(1);
 * // => 1
 * const schema = NonNegativeIntegerSchema.parse(-1);
 * // => throws an error
 * const schema = NonNegativeIntegerSchema.parse('1');
 * // => 1
 * const schema = NonNegativeIntegerSchema.parse(0);
 * // => 0
 * ```
 */
export const NonNegativeIntegerSchema = z
	.union([z.string(), z.number()])
	.transform(value => Number(value))
	.pipe(z.number().int().nonnegative());

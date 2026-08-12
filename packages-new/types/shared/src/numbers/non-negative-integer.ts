/* * */

import { z } from 'zod';

/**
 * A schema for non-negative integers.
 * It coerces the value to an integer and ensures it is non-negative.
 * @example
 * ```ts
 * const schema = NonNegativeIntegerSchema.parse(1);
 * // => 1
 * const schema = NonNegativeNumberSchema.parse(-1);
 * // => throws an error
 * const schema = NonNegativeNumberSchema.parse('1');
 * // => 1
 * ```
 */
export const NonNegativeIntegerSchema = z
	.coerce
	.number()
	.int()
	.nonnegative();

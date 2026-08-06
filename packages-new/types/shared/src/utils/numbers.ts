/* * */

import { z } from 'zod';

/**
 * A schema for non-negative numbers.
 * It coerces the value to a number and ensures it is non-negative.
 * @example
 * ```ts
 * const schema = NonNegativeNumberSchema.parse(1);
 * // => 1
 * const schema = NonNegativeNumberSchema.parse(-1);
 * // => throws an error
 * const schema = NonNegativeNumberSchema.parse('1');
 * // => 1
 * ```
 */
export const NonNegativeNumberSchema = z.coerce
	.number()
	.nonnegative();

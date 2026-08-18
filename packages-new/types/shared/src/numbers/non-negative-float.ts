/* * */

import { z } from 'zod';

/**
 * A schema for non-negative floats.
 * It coerces the value to a number and ensures it is non-negative.
 * @example
 * ```ts
 * const schema = NonNegativeFloatSchema.parse(1);
 * // => 1
 * const schema = NonNegativeFloatSchema.parse(-1);
 * // => throws an error
 * const schema = NonNegativeFloatSchema.parse('1');
 * // => 1
 * const schema = NonNegativeFloatSchema.parse(0);
 * // => 0
 * ```
 */
export const NonNegativeFloatSchema = z
	.coerce
	.number()
	.nonnegative();

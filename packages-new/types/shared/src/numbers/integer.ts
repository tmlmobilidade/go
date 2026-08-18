/* * */

import { z } from 'zod';

/**
 * A schema for integers.
 * It coerces the value to an integer.
 * @example
 * ```ts
 * const schema = IntegerSchema.parse(1);
 * // => 1
 * const schema = IntegerSchema.parse(-1);
 * // => throws an error
 * const schema = IntegerSchema.parse('1');
 * // => 1
 * ```
 */
export const IntegerSchema = z
	.coerce
	.number()
	.int();

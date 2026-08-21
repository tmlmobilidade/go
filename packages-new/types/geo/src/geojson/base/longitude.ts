/* * */

import { z } from 'zod';

/**
 * The longitude of a geographic coordinate, in degrees.
 */
export type Longitude = number & {
	__brand: 'Longitude'
};

/**
 * The schema for a longitude value.
 * @example
 * ```ts
 * const longitude = LongitudeSchema.parse('-9.55841684');
 * // => -9.558416
 *
 * const longitude = LongitudeSchema.parse(-9.55841684);
 * // => -9.558416
 *
 * const longitude = LongitudeSchema.parse('180.1');
 * // => Throws an error: 'Longitude must be between -180 and 180'
 */
export const LongitudeSchema = z
	.coerce
	.number()
	.min(-180, 'Longitude must be between -180 and 180')
	.max(180, 'Longitude must be between -180 and 180')
	.transform(value => Number(value.toFixed(6)) as Longitude);

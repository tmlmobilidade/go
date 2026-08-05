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
	.union([z.string(), z.number()])
	.transform(validateLongitude);

/**
 * Validate a longitude value.
 * @param value The longitude value to validate.
 * @throws An error if the longitude value is invalid.
 * @returns The validated longitude value.
 */
export function validateLongitude(value: number | string): Longitude {
	const valueAsNumber = parseFloat(String(value));
	if (Number.isNaN(valueAsNumber)) throw new Error('Longitude must be a valid number');
	if (valueAsNumber < -180 || valueAsNumber > 180) throw new Error('Longitude must be between -180 and 180');
	return Number(valueAsNumber.toFixed(6)) as Longitude;
}

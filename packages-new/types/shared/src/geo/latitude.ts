/* * */

import { z } from 'zod';

/**
 * The latitude of a geographic coordinate, in degrees.
 */
export type Latitude = number & {
	__brand: 'Latitude'
};

/**
 * The schema for a latitude value.
 * @example
 * ```ts
 * const latitude = LatitudeSchema.parse('40.712886213');
 * // => 40.712886
 *
 * const latitude = LatitudeSchema.parse(40.712886213);
 * // => 40.712886
 *
 * const latitude = LatitudeSchema.parse('94.7128');
 * // => Throws an error: 'Latitude must be between -90 and 90'
 */
export const LatitudeSchema = z
	.union([z.string(), z.number()])
	.transform(validateLatitude);

/**
 * Validate a latitude value.
 * @param value The latitude value to validate.
 * @throws An error if the latitude value is invalid.
 * @returns The validated latitude value.
 */
export function validateLatitude(value: number | string): Latitude {
	const valueAsNumber = parseFloat(String(value));
	if (Number.isNaN(valueAsNumber)) throw new Error('Latitude must be a valid number');
	if (valueAsNumber < -90 || valueAsNumber > 90) throw new Error('Latitude must be between -90 and 90');
	return Number(valueAsNumber.toFixed(6)) as Latitude;
}

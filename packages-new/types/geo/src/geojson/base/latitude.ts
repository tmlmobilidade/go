/* * */

import { validationMessage } from '@tmlmobilidade/go-utils-validation';
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
export const LatitudeSchema: z.ZodType<Latitude> = z
	.coerce
	.number()
	.min(-90, { error: validationMessage('custom.geo.latitude', { maximum: 90, minimum: -90 }) })
	.max(90, { error: validationMessage('custom.geo.latitude', { maximum: 90, minimum: -90 }) })
	.transform(value => Number(value.toFixed(6)) as Latitude);

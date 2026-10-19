/* * */

import { z } from 'zod';

/**
 * Represents a hex color as a string in the format `RRGGBB`,
 * ensuring the `#` prefix is present.
 * @example `#000000` (black)
 * @example `#FFFFFF` (white)
 */
export type RouteColor = string & {
	__brand: 'RouteColor'
};

/**
 * The schema for a hex color value for a GTFS route.
 * @example
 * ```ts
 * const routeColor = RouteColorSchema.parse('#000000');
 * // => '000000' as RouteColor
 *
 * const routeColor = RouteColorSchema.parse('FFFFFF');
 * // => 'FFFFFF' as RouteColor
 * ```
 */
export const RouteColorSchema = z
	.coerce
	.string()
	.transform(value => value.startsWith('#') ? value.slice(1) : value)
	.refine(value => /^[0-9A-Fa-f]{6}$/.test(value), { message: 'Expected a hex color in the format RRGGBB' })
	.transform(value => value.toUpperCase() as RouteColor);

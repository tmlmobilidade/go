/* * */

import { z } from 'zod';

/**
 * Represents a hex color as a string in the format `RRGGBB`,
 * ensuring the `#` prefix is present.
 * @example `#000000` (black)
 * @example `#FFFFFF` (white)
 */
export type HexColor = string & {
	__brand: 'HexColor'
};

/**
 * The schema for a hex color value.
 * @example
 * ```ts
 * const hexColor = HexColorSchema.parse('#000000');
 * // => '#000000' as HexColor
 *
 * const hexColor = HexColorSchema.parse('FFFFFF');
 * // => '#FFFFFF' as HexColor
 * ```
 */
export const HexColorSchema = z
	.coerce
	.string()
	.transform(value => value.startsWith('#') ? value : `#${value}`)
	.refine(value => /^#[0-9A-Fa-f]{6}$/.test(value), { message: 'Expected a hex color in the format #RRGGBB' })
	.transform(value => value.toUpperCase() as HexColor);

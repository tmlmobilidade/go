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
	.string()
	.transform(validateHexColor);

/**
 * This function validates if a value is a valid hex color.
 * @param value The value to be validated with or without the `#` prefix.
 * @returns The given value as a HexColor, without the `#` prefix.
 * @throws An error if the value is invalid.
 * @example
 * ```ts
 * const hexColor = validateHexColor('#000000');
 * // => '#000000' as HexColor
 *
 * const hexColor = validateHexColor('FFFFFF');
 * // => '#FFFFFF' as HexColor
 *
 * const hexColor = validateHexColor('not a hex color');
 * // => Throws an error: 'Invalid hex color format 'not a hex color', expected format: RRGGBB'
 *
 * const hexColor = validateHexColor('not a hex color');
 * // => Throws an error: 'Invalid hex color format 'not a hex color', expected format: RRGGBB'
 * ```
 */
export function validateHexColor(value: string): HexColor {
	if (!value.startsWith('#')) value = `#${value}`;
	if (!value.match(/^#[0-9A-Fa-f]{6}$/)) throw new Error(`Invalid hex color format '${value}', expected format: #RRGGBB`);
	return value.toUpperCase() as HexColor;
}

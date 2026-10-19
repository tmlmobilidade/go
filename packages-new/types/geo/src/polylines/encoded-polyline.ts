/* * */

import { z } from 'zod';

import { type Latitude, LatitudeSchema } from '../geojson/base/latitude.js';
import { type Longitude, LongitudeSchema } from '../geojson/base/longitude.js';

/**
 * The encoded polyline for a geographic LineString,
 * with values in E6 format (6 decimal places
 * of precision in latitude and longitude).
 */
export type EncodedPolyline = string & {
	__brand: 'EncodedPolyline'
};

/**
 * The schema for a encoded polyline value,
 * with values in E6 format (6 decimal places
 * of precision in latitude and longitude).
 */
export const EncodedPolylineSchema = z
	.string()
	.refine(isEncodedPolyline, { message: 'Invalid encoded polyline' })
	.transform(value => value as EncodedPolyline);

/**
 * Validate an encoded polyline value.
 * @param value The encoded polyline value to validate.
 * @throws An error if the encoded polyline value is invalid.
 * @returns The validated encoded polyline value.
 */
export function isEncodedPolyline(value: string): boolean {
	try {
		parseEncodedPolyline(value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Parses an encoded polyline.
 * @param encoded The encoded polyline to parse.
 * @param onPoint A callback function that receives the latitude
 * and longitude values for each decoded coordinate.
 * @throws An error if the input is malformed.
 */
export function parseEncodedPolyline(encoded: string, onPoint?: (lat: Latitude, lng: Longitude) => void) {
	// Initialize the index to 0.
	let index = 0;
	let lat = 0;
	let lng = 0;
	// Define a function to read a value
	// from the encoded polyline at the current index.
	function readValue(): number {
		let result = 0;
		let shift = 0;
		// Loop until the end of the encoded polyline is reached.
		while (true) {
			// If the end of the encoded polyline is reached, throw an error.
			if (index >= encoded.length) throw new Error('Unexpected end of encoded polyline.');
			// Get the next character in the encoded polyline.
			const char = encoded.charCodeAt(index++);
			// If the character is not a valid character, throw an error.
			if (char < 63 || char > 126) throw new Error(`Invalid character '${String.fromCharCode(char)}'.`);
			// Get the byte value of the character.
			const byte = char - 63;
			// Add the byte value to the result
			// and shift the result by the number of bits.
			result |= (byte & 0x1f) << shift;
			shift += 5;
			// If the byte value is not the last byte, break the loop.
			if ((byte & 0x20) === 0) break;
		}
		// If the result is odd, negate it.
		return (result & 1) ? ~(result >> 1) : (result >> 1);
	}
	// Loop until the end of the encoded polyline is reached.
	while (index < encoded.length) {
		// Read the next values from the encoded polyline.
		lat += readValue(); // Read the latitude value.
		lng += readValue(); // Read the longitude value.
		// Validate the latitude and longitude values.
		const validatedLat = LatitudeSchema.parse(lat / 1e6);
		const validatedLng = LongitudeSchema.parse(lng / 1e6);
		// Call the callback function with the decoded coordinate.
		onPoint?.(validatedLat, validatedLng);
	}
}

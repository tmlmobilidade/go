/* * */

import { type EncodedPolyline, EncodedPolylineSchema, type GeoJsonLineStringGeometry, GeoJsonLineStringGeometrySchema } from '@tmlmobilidade/go-types-geo';

/**
 * Decode a polyline from an encoded string into a GeoJSON LineString.
 * @param value The polyline to encode.
 * @returns The encoded polyline.
 */
export function fromGeoJsonLineStringToEncodedPolyline(lineString: GeoJsonLineStringGeometry): EncodedPolyline {
	// Validate the GeoJSON LineString.
	const validatedLineString = GeoJsonLineStringGeometrySchema.parse(lineString);
	// Initialize the output string.
	let result = '';
	// Initialize the previous latitude and longitude values.
	let previousLat = 0;
	let previousLng = 0;
	// Define a function to encode a value.
	function encodeValue(value: number): string {
		// Initialize the output string.
		let result = '';
		// If the value is negative, negate it.
		value = value < 0 ? ~(value << 1) : value << 1;
		// Loop until the value is less than 0x20.
		while (value >= 0x20) {
			// Add the encoded value to the output string.
			result += String.fromCharCode((value & 0x1f) | 0x20 | 63);
			// Shift the value by 5 bits.
			value >>= 5;
		}
		// Add the final encoded value to the output string.
		result += String.fromCharCode(value + 63);
		// Return the encoded value.
		return result;
	}
	// Loop through the coordinates of the polyline.
	for (const [lng, lat] of validatedLineString.coordinates) {
		// Encode the latitude and longitude values.
		result += encodeValue(lat - previousLat);
		result += encodeValue(lng - previousLng);
		// Update the previous latitude and longitude values.
		previousLat = lat;
		previousLng = lng;
	}
	// Validate and return the encoded polyline.
	return EncodedPolylineSchema.parse(result);
}


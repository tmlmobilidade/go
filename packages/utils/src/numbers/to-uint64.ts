/* * */

/**
 * Utility function to convert a hexadecimal string to a uint64 string.
 * @param hex The hexadecimal string to convert to a uint64 string.
 * @returns The uint64 string.
 * @example
 * toUInt64('1234567890'); // returns '1234567890'
 */
export function toUInt64(hex: string): null | string {
	if (!hex) return null;
	if (typeof hex !== 'string') return null;
	if (hex.startsWith('0x')) return hex;
	return BigInt(`0x${hex}`).toString();
}

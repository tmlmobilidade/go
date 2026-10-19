/* * */

import crypto from 'node:crypto';

/**
 * Generates a SHA-256 hash for a TTS string and its resource ID.
 * @param string The TTS string.
 * @param id The ID of the resource the string belongs to.
 * @returns The hex-encoded hash.
 */
export async function generateHash(string: string, id: string) {
	const hashInput = `${string}${id}`;
	return crypto.createHash('sha256').update(hashInput).digest('hex');
};

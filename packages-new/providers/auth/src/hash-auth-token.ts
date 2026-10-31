/* * */

import { createHash } from 'node:crypto';

/**
 * Hash an authentication token using the SHA-256 algorithm.
 * Intended to store only a one-way digest of high-entropy bearer tokens.
 * @param token The token to hash.
 * @returns The hashed token.
 */
export function hashAuthToken(token: string): string {
	return `sha256:${createHash('sha256').update(token).digest('hex')}`;
}

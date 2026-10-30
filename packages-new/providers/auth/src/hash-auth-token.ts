import { createHash } from 'node:crypto';

/** Store only a one-way digest of high-entropy bearer tokens. */
export function hashAuthToken(token: string): string {
	return `sha256:${createHash('sha256').update(token).digest('hex')}`;
}

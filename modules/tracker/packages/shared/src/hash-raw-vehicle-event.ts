/* * */

import { type HashableRawVehicleEvent, type RawVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import crypto from 'node:crypto';

/* * */

/**
 * Hashes the relevant fields of a raw vehicle event to create
 * a unique identifier for the event. This allows duplicate events
 * to be identified and skipped instead of stored multiple times.
 * @param hashableRawEvent The hashable subset of the raw vehicle event
 * @returns The SHA-256 hex digest of the serialized event
 */
export function hashRawVehicleEvent<T extends RawVehicleEvent>(hashableRawEvent: HashableRawVehicleEvent<T>): string {
	return crypto
		.createHash('sha256')
		.update(JSON.stringify(hashableRawEvent))
		.digest('hex');
}

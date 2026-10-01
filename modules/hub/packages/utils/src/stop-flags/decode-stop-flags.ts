/* * */

import { type HubV1ApiStopFlag } from '@tmlmobilidade/go-types-hub';

/**
 * Decodes the stop flags into an object in the format:
 * ```ts
 * const decoded = [{ agencyId: stopId }, { agencyId: stopId }, ...];
 * ```
 * @param flags The stop flags to decode.
 * @param agencyIds The agency IDs to filter the flags by. If not provided, all flags will be decoded.
 * @returns The decoded stop flags.
 */
export function decodeStopFlags(encodedFlags: string): HubV1ApiStopFlag[] {
	//

	//
	// Validate that the encoded flags is a string

	if (!encodedFlags) {
		throw new Error('Invalid encoded flags: must be a non-empty string.');
	}

	//
	// Decode the flags

	const decodedStopFlags: HubV1ApiStopFlag[] = [];

	for (const encodedFlag of encodedFlags.split('|')) {
		const [agencyId, stopId] = encodedFlag.split('-');
		decodedStopFlags.push({ agency_id: agencyId, stop_id: stopId });
	}

	return decodedStopFlags;
}

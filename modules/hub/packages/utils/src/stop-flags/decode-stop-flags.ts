/* * */

export interface DecodedStopFlag {
	agency_id: string
	stop_id: string
}

/**
 * Decodes the stop flags into an object in the format:
 * ```ts
 * const decoded = [{ agencyId: stopId }, { agencyId: stopId }, ...];
 * ```
 * @param flags The stop flags to decode.
 * @param agencyIds The agency IDs to filter the flags by. If not provided, all flags will be decoded.
 * @returns The decoded stop flags.
 */
export function decodeStopFlags(encodedFlags: string): DecodedStopFlag[] {
	//

	//
	// Validate that the encoded flags is a string

	if (!encodedFlags) {
		throw new Error('Invalid encoded flags: must be a non-empty string.');
	}

	//
	// Decode the flags

	const decodedStopFlags: DecodedStopFlag[] = [];

	for (const encodedFlag of encodedFlags.split('|')) {
		const [agencyId, stopId] = encodedFlag.split('-');
		decodedStopFlags.push({ agency_id: agencyId, stop_id: stopId });
	}

	return decodedStopFlags;
}

/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/**
 * Encodes the stop flags into a string in the format:
 * ```ts
 * const encoded = "agencyId-stopId|agencyId-stopId|...";
 * ```
 * @param flags The stop flags to encode.
 * @param agencyIds The agency IDs to filter the flags by. If not provided, all flags will be encoded.
 * @returns The encoded stop flags.
 */
export function encodeStopFlags(flags: Stop['flags'], agencyIds?: string[]): string {
	//

	//
	// Validate that the flags is an array

	if (!Array.isArray(flags)) {
		throw new Error('Invalid flags: must be an array.');
	}

	//
	// Encode the flags

	const formattedStopFlagsValue: string[] = [];

	for (const flagData of flags) {
		for (const agencyId of flagData.agency_ids) {
			if (agencyIds && !agencyIds.includes(agencyId)) continue;
			formattedStopFlagsValue.push(`${agencyId}-${flagData.stop_id}`);
		}
	}

	return formattedStopFlagsValue.join('|');
}

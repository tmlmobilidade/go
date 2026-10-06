/* eslint-disable perfectionist/sort-objects */

import { type InfrastructureNodesV1Input, type InfrastructureNodesV1OutputRow } from './types.js';

/* * */

/**
 * Converts a stop's flags into rows for node.txt.
 * @param input The stop with the flags and agencies selected for export, plus node identifiers, mode and validity dates.
 * @param agencyCodesById Public agency codes indexed by internal agency ID.
 * @returns One row per agency in each flag, in CSV column order.
 */
export function toOutputRows(input: InfrastructureNodesV1Input, agencyCodesById: ReadonlyMap<string, string>): InfrastructureNodesV1OutputRow[] {
	return input.stop.flags.flatMap(flag => flag.agency_ids.map((agencyId) => {
		const agencyCode = agencyCodesById.get(agencyId);
		if (agencyCode === undefined) throw new Error(`Agency code not found for agency ${agencyId}`);

		return {
			operator_id: agencyCode,
			operator_stop_id: flag.stop_id,
			stop_name: input.stop.name,
			lat: input.stop.latitude,
			lon: input.stop.longitude,
			quay_id: input.quay_id,
			stop_place_id: input.stop_place_id,
			mode: input.mode,
			valid_from: input.valid_from,
			valid_to: input.valid_to ?? '',
		};
	}));
}

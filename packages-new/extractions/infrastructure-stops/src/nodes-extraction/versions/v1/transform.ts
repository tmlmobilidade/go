/* eslint-disable perfectionist/sort-objects */

import { type TransportType } from '@tmlmobilidade/go-types-offer';

import { type InfrastructureNodesV1Input, type InfrastructureNodesV1OutputRow } from './types.js';

/* * */

const MODE_BY_TRANSPORT_TYPE = {
	aerial_lift: 'CABLEWAY',
	bus: 'BUS',
	cable_tram: 'TRAM',
	ferry: 'FERRY',
	funicular: 'FUNICULAR',
	monorail: null,
	rail: 'RAIL',
	subway: 'METRO',
	tram: 'TRAM',
	trolleybus: 'TROLLEYBUS',
} satisfies Record<TransportType, Exclude<InfrastructureNodesV1OutputRow['mode'], ''> | null>;

/* * */

/**
 * Converts a stop's flags into rows for nodes.txt.
 * @param input The stop with the flags and agencies selected for export, plus namespace, parent station ID, mode and validity dates.
 * @param agencyCodesById Public agency codes indexed by internal agency ID.
 * @returns One row per agency in each flag, in CSV column order.
 */
export function toOutputRows(input: InfrastructureNodesV1Input, agencyCodesById: ReadonlyMap<string, string>): InfrastructureNodesV1OutputRow[] {
	const mode = input.mode ? MODE_BY_TRANSPORT_TYPE[input.mode] : '';
	if (mode === null) throw new Error(`Transport type ${input.mode} has no nodes mode mapping for stop ${input.stop._id}`);

	return input.stop.flags.flatMap(flag => flag.agency_ids.map((agencyId) => {
		const agencyCode = agencyCodesById.get(agencyId);
		if (agencyCode === undefined) throw new Error(`Agency code not found for agency ${agencyId}`);

		return {
			operator_id: agencyCode,
			operator_stop_id: flag.stop_id,
			stop_name: input.stop.name,
			lat: input.stop.latitude,
			lon: input.stop.longitude,
			quay_id: `${input.namespace}:Quay:${input.stop._id}`,
			stop_place_id: input.parent_station_id || input.stop._id,
			mode,
			valid_from: input.valid_from,
			valid_to: input.valid_to ?? '',
		};
	}));
}

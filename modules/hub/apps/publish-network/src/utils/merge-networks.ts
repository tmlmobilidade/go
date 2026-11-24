/* * */

import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

import { type Network } from '../types/network.js';

/* * */

export function mergeNetworks(networks: Network[]): Network {
	const stops = new Map<string, HubV1ApiStop>();

	for (const network of networks) {
		for (const stop of network.stops) {
			const previous = stops.get(stop._id);
			if (!previous) {
				stops.set(stop._id, { ...stop });
				continue;
			}

			previous.agency_ids = Array.from(new Set([...previous.agency_ids, ...stop.agency_ids]));
			previous.line_ids = Array.from(new Set([...previous.line_ids, ...stop.line_ids]));
			previous.route_ids = Array.from(new Set([...previous.route_ids, ...stop.route_ids]));
			previous.pattern_ids = Array.from(new Set([...previous.pattern_ids, ...stop.pattern_ids]));
			previous.legacy_ids = Array.from(new Set([...previous.legacy_ids, ...stop.legacy_ids]));
			previous.flags = Array.from(new Map([...previous.flags, ...stop.flags].map(flag => [JSON.stringify(flag), flag])).values());
		}
	}

	return {
		lines: networks.flatMap(network => network.lines),
		patterns: networks.flatMap(network => network.patterns),
		routes: networks.flatMap(network => network.routes),
		stops: Array.from(stops.values()),
	};
}

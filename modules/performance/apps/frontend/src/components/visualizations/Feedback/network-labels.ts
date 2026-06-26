/* * */

import type { HubLine, HubStop } from '@tmlmobilidade/types';

/* * */

function parsePrefixedLineId(lineId: string) {
	const prefixedLineId = lineId.match(/^\[(\d+)\](.+)$/);
	if (!prefixedLineId) return null;

	return {
		agencyId: prefixedLineId[1],
		rawId: prefixedLineId[2],
	};
}

function getLineLookupKeys(lineId: string) {
	const prefixedLineId = parsePrefixedLineId(lineId);
	if (!prefixedLineId) return [lineId];

	return [`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, prefixedLineId.rawId, lineId];
}

function buildLineLabel(line: HubLine) {
	if (line.short_name && line.long_name) return `${line.short_name} - ${line.long_name}`;
	return line.long_name || line.short_name || line._id;
}

function buildStopLabel(stop: HubStop) {
	return stop.name || stop.short_name || String(stop._id);
}

/* * */

export function buildLineLabelsById(lines?: HubLine[]) {
	const labels = new Map<string, string>();

	for (const line of lines ?? []) {
		const label = buildLineLabel(line);
		const lineId = String(line._id);
		const prefixedLineId = parsePrefixedLineId(lineId);

		labels.set(lineId, label);
		labels.set(`${line.agency_id}:${lineId}`, label);

		if (prefixedLineId) {
			labels.set(`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, label);
			if (!labels.has(prefixedLineId.rawId)) labels.set(prefixedLineId.rawId, label);
		}
	}

	return labels;
}

export function buildLineAgenciesById(lines?: HubLine[]) {
	const agencies = new Map<string, string>();

	for (const line of lines ?? []) {
		const lineId = String(line._id);
		const prefixedLineId = parsePrefixedLineId(lineId);

		agencies.set(lineId, line.agency_id);
		agencies.set(`${line.agency_id}:${lineId}`, line.agency_id);

		for (const routeId of line.route_ids) {
			agencies.set(routeId, line.agency_id);
			agencies.set(`${line.agency_id}:${routeId}`, line.agency_id);
		}

		if (prefixedLineId) {
			agencies.set(`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, line.agency_id);
			if (!agencies.has(prefixedLineId.rawId)) agencies.set(prefixedLineId.rawId, line.agency_id);
		}
	}

	return agencies;
}

export function buildStopLabelsById(stops?: HubStop[]) {
	const labels = new Map<string, string>();

	for (const stop of stops ?? []) {
		const label = buildStopLabel(stop);
		labels.set(String(stop._id), label);
		for (const legacyId of stop.legacy_ids) labels.set(String(legacyId), label);
	}

	return labels;
}

export function getLineLabel(lineId: string, labels: Map<string, string>) {
	for (const key of getLineLookupKeys(lineId)) {
		const label = labels.get(key);
		if (label) return label;
	}

	return lineId;
}

export function getLineAgencyId(lineId: string, agencies: Map<string, string>) {
	for (const lookupKey of getLineLookupKeys(lineId)) {
		const agencyId = agencies.get(lookupKey);
		if (agencyId) return agencyId;
	}

	const prefixedLineId = parsePrefixedLineId(lineId);
	if (prefixedLineId) return prefixedLineId.agencyId;

	return lineId.match(/^(\d+):/)?.[1];
}

export function getStopLabel(stopId: string, labels: Map<string, string>) {
	return labels.get(stopId) ?? stopId;
}

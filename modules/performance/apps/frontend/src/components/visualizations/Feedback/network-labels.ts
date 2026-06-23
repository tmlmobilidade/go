/* * */

import type { HubLine, HubStop } from '@tmlmobilidade/types';

/* * */

function parsePrefixedId(id: string) {
	const prefixedId = id.match(/^\[(\d+)\](.+)$/);
	if (!prefixedId) return null;

	return {
		agencyId: prefixedId[1],
		rawId: prefixedId[2],
	};
}

function getLineLookupKeys(lineId: string) {
	const prefixedLineId = parsePrefixedId(lineId);
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
		const prefixedLineId = parsePrefixedId(lineId);

		labels.set(lineId, label);
		labels.set(`${line.agency_id}:${lineId}`, label);

		if (prefixedLineId) {
			labels.set(`${prefixedLineId.agencyId}:${prefixedLineId.rawId}`, label);
			if (!labels.has(prefixedLineId.rawId)) labels.set(prefixedLineId.rawId, label);
		}
	}

	return labels;
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

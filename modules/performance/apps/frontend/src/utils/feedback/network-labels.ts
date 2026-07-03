/* * */

export interface FeedbackNetworkLine {
	_id: number | string
	agency_id: string
	long_name?: string
	short_name?: string
}

export interface FeedbackNetworkStop {
	_id: number | string
	legacy_ids?: (number | string)[]
	name?: string
	short_name?: string
}

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

function buildLineLabel(line: FeedbackNetworkLine) {
	if (line.short_name && line.long_name) return `${line.short_name} - ${line.long_name}`;
	return line.long_name || line.short_name || String(line._id);
}

function buildStopLabel(stop: FeedbackNetworkStop) {
	return stop.name || stop.short_name || String(stop._id);
}

/* * */

export function buildLineLabelsById(lines?: FeedbackNetworkLine[]) {
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

export function buildStopLabelsById(stops?: FeedbackNetworkStop[]) {
	const labels = new Map<string, string>();

	for (const stop of stops ?? []) {
		const label = buildStopLabel(stop);
		labels.set(String(stop._id), label);
		for (const legacyId of stop.legacy_ids ?? []) labels.set(String(legacyId), label);
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

export function getStopLabel(stopId: string, labels: Map<string, string>) {
	return labels.get(stopId) ?? stopId;
}

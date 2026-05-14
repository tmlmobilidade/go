/* * */

import type { Alert, EntitySelector } from '@tmlmobilidade/go-hub-pckg-types';

/* * */

type JsonObject = Record<string, unknown>;

function ptString(text: string) {
	return {
		translation: [{ language: 'pt', text }],
	};
}

function isAlreadyHubShaped(row: JsonObject): boolean {
	const ht = row.header_text as undefined | { translation?: { text?: unknown }[] };
	const t0 = ht?.translation?.[0]?.text;
	return Boolean(row.alert_id && typeof t0 === 'string' && t0.length > 0);
}

function isMongoJsonAlert(row: JsonObject): boolean {
	return typeof row.active_period_start_date === 'number' && row._id != null;
}

function msToGtfsSeconds(ms: number): number {
	if (!Number.isFinite(ms)) return 0;
	return Math.floor(ms / 1000);
}

function buildInformedEntity(row: JsonObject): EntitySelector[] {
	const agencyId = typeof row.agency_id === 'string' ? row.agency_id : undefined;
	const refs = row.references as undefined | { child_ids?: string[], parent_id: string }[];
	const refType = typeof row.reference_type === 'string' ? row.reference_type : undefined;

	if (!agencyId) return [];

	if (!refs?.length) {
		return [{ agency_id: agencyId }];
	}

	switch (refType) {
		case 'agency':
			return [{ agency_id: refs[0]?.parent_id ?? agencyId }];
		case 'lines':
			return refs.map(ref => ({
				agency_id: agencyId,
				line_id: String(ref.parent_id),
			}));
		case 'rides':
			return refs.map(ref => ({
				agency_id: agencyId,
				trip_id: String(ref.parent_id),
			}));
		case 'stops':
			return refs.map(ref => ({
				agency_id: agencyId,
				stop_id: String(ref.parent_id),
			}));
		default:
			return [{ agency_id: agencyId }];
	}
}

function mongoRowToHubAlert(row: JsonObject): Alert {
	const id = String(row._id ?? row.alert_id ?? '');
	const startMs = Number(row.active_period_start_date);
	const endMs = row.active_period_end_date != null && row.active_period_end_date !== undefined
		? Number(row.active_period_end_date)
		: undefined;

	const startSec = msToGtfsSeconds(startMs);
	const endSec = endMs != null && Number.isFinite(endMs) ? msToGtfsSeconds(endMs) : undefined;

	const imageUrl = typeof row.image_url === 'string' && row.image_url.length > 0 ? row.image_url : undefined;
	const coords = row.coordinates;

	const image = imageUrl
		? {
			localized_image: [{
				language: 'pt',
				mediaType: 'image/*',
				url: imageUrl,
			}],
		}
		: { localized_image: [] as { language: string, mediaType: string, url: string }[] };

	const infoUrl = typeof row.info_url === 'string' && row.info_url.length > 0 ? row.info_url : '';

	const hasCoords = Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number';

	return {
		active_period: [{
			start: startSec,
			...(endSec !== undefined ? { end: endSec } : {}),
		}],
		alert_id: id,
		cause: row.cause as Alert['cause'],
		...(hasCoords ? { coordinates: [coords[0], coords[1]] as [number, number] } : {}),
		description_text: ptString(typeof row.description === 'string' ? row.description : ''),
		effect: row.effect as Alert['effect'],
		header_text: ptString(typeof row.title === 'string' ? row.title : ''),
		image,
		informed_entity: buildInformedEntity(row),
		url: ptString(infoUrl),
	} as Alert;
}

/**
 * Cache `hub:alerts:published:json` historically stored Mongo alert documents.
 * Navegante expects GTFS-shaped {@link Alert} (header_text, active_period in seconds, alert_id, …).
 */
export function normalizePublishedJsonAlerts(raw): Alert[] {
	if (!raw) return [];

	return raw.map((item) => {
		const row = item;

		if (isAlreadyHubShaped(row)) {
			return row as Alert;
		}

		if (isMongoJsonAlert(row)) {
			return mongoRowToHubAlert(row);
		}

		return row as Alert;
	});
}

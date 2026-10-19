/* * */

import { type OfferZonesV1OutputRow, type OfferZonesV1QueryRow } from './types.js';

/* * */

/** Flattens a zone into one CSV row, leaving missing metadata empty. */
export function parseZonesExtraction(zone: OfferZonesV1QueryRow): OfferZonesV1OutputRow {
	return {
		_id: zone._id,
		agency_ids: zone.agency_ids?.join('|') ?? '',
		code: zone.code ?? '',
		name: zone.name ?? '',
	};
}

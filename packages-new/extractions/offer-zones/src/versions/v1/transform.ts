/* * */

import { type Zone, ZoneSchema } from '@tmlmobilidade/go-types-offer';

import { type OfferZonesV1OutputRowInput } from './types.js';

/**
 * Converts a stored zone into non-geometric CSV metadata.
 * @param zone The stored zone, which may contain missing or invalid fields.
 * @returns The formatted fields, ready for validation of each CSV cell.
 */
export function parseZonesExtraction(zone: Partial<Zone>): OfferZonesV1OutputRowInput {
	const agencyIdsResult = ZoneSchema.shape.agency_ids.safeParse(zone.agency_ids);

	return {
		_id: zone._id,
		agency_ids: agencyIdsResult.success ? agencyIdsResult.data.join('|') : '',
		code: zone.code,
		name: zone.name,
	};
}

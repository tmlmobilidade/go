/* * */

import { type OfferZonesV1QueryRow } from './types.js';

/* * */

/** The zone fields required by the v1 CSV export. */
export const offerZonesV1ExtractionQuery = {
	projection: {
		_id: 1,
		agency_ids: 1,
		code: 1,
		name: 1,
	},
} satisfies { projection: Record<keyof OfferZonesV1QueryRow, 1> };

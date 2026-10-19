/* * */

import { type Zone } from '@tmlmobilidade/go-types-offer';

/* * */

export type OfferZonesV1QueryRow = Pick<Zone, '_id' | 'agency_ids' | 'code' | 'name'>;

export interface OfferZonesV1OutputRow {
	_id: string
	agency_ids: string
	code: string
	name: string
}

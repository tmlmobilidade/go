/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type OfferZonesV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type Zone } from '@tmlmobilidade/go-types-offer';

/**
 * Builds the zones pipeline from filters restricted to the user's agency access.
 * @param properties The validated, permitted extraction properties.
 * @returns The matching zones, ordered as in the Zones list.
 */
export function buildZonesExtractionPipeline(properties: OfferZonesV1ExtractionProperties): AggregationPipeline<Zone> {
	return [
		{ $match: { agency_ids: { $in: properties.agency_ids } } },
		{ $sort: { created_at: -1 } },
	];
}

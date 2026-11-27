import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OfferZonesGeopackageV1Extraction, OfferZonesGeopackageV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';

import { writeZonesGeoPackage } from './write-zones-geopackage.js';

/* * */

/** Exports the selected zones using the requester's current agency access. */
export async function offerZonesGeopackageV1Extraction(context: ExtractionTaskContext, extraction: OfferZonesGeopackageV1Extraction): Promise<ExtractionTaskResult> {
	const properties = OfferZonesGeopackageV1ExtractionPropertiesSchema.parse(extraction.properties);
	const zoneIds = [...new Set(properties.zone_ids)];

	const zones = await goDb.offer.zones.findMany({
		_id: { $in: zoneIds },
	}, { sort: { _id: 1 } });

	if (zones.length !== zoneIds.length) throw new Error('One or more selected zones are no longer available.');

	await writeZonesGeoPackage(context.output_path, zones);
}

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OfferZonesGeopackageV1Extraction, OfferZonesGeopackageV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { writeZonesGeoPackage } from './write-zones-geopackage.js';

/* * */

/** Exports the selected zones using the requester's current agency access. */
export async function offerZonesGeopackageV1Extraction(context: ExtractionTaskContext, extraction: OfferZonesGeopackageV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// A. Parse the extraction properties

	const properties = OfferZonesGeopackageV1ExtractionPropertiesSchema.parse(extraction.properties);
	const zoneIds = [...new Set(properties.zone_ids)];

	//
	// B. Find the selected zones

	Logger.info({ message: `Loading ${zoneIds.length} selected zones for GeoPackage extraction ${extraction._id}.` });

	const zones = await goDb.offer.zones.findMany({
		_id: { $in: zoneIds },
	}, { sort: { _id: 1 } });

	//
	// C. Validate the selected zones

	Logger.info({ message: `Loaded ${zones.length} of ${zoneIds.length} requested zones.` });
	if (zones.length !== zoneIds.length) throw new Error('One or more selected zones are no longer available.');

	//
	// D. Write the zone geometries to the GeoPackage

	await writeZonesGeoPackage(context.output_path, zones);
}

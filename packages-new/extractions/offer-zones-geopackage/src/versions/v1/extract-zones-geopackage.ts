import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OfferZonesGeopackageV1Extraction, OfferZonesGeopackageV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { writeZonesGeoPackage } from './write-zones-geopackage.js';

/* * */

/**
 * Resolves the IDs saved in the extraction request against the current Offer zones.
 * On success, the worker zips and uploads the file written to its output directory.
 * @param context The worker workspace for this extraction.
 * @param extraction The queued request containing the selected zone IDs.
 */
export async function offerZonesGeopackageV1Extraction(context: ExtractionTaskContext, extraction: OfferZonesGeopackageV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// A. Require at least one zone ID and count repeated selections once

	const properties = OfferZonesGeopackageV1ExtractionPropertiesSchema.parse(extraction.properties);
	const zoneIds = [...new Set(properties.zone_ids)];

	//
	// B. Read the current zone records in stable ID order

	Logger.info({ message: `Loading ${zoneIds.length} selected zones for GeoPackage extraction ${extraction._id}.` });

	const zones = await goDb.offer.zones.findMany({
		_id: { $in: zoneIds },
	}, { sort: { _id: 1 } });

	//
	// C. Fail the whole export if a zone disappeared after the request was queued

	Logger.info({ message: `Loaded ${zones.length} of ${zoneIds.length} requested zones.` });
	if (zones.length !== zoneIds.length) throw new Error('One or more selected zones are no longer available.');

	//
	// D. Write the zone geometries to the GeoPackage

	await writeZonesGeoPackage(context.output_path, zones);
}

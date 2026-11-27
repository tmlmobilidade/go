import { type Zone } from '@tmlmobilidade/go-types-offer';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { convertGeoPackage } from './convert-geopackage.js';

/* * */

/**
 * Writes zones.gpkg with one row per source Polygon or MultiPolygon.
 * A zone with two polygon features produces two rows with the same zone_id.
 * A supplied GeoJSON without polygons produces one row with the zone attributes and a null geometry.
 * @throws If a selected zone has no GeoJSON.
 * @param outputPath The directory the worker will archive.
 * @param zones The selected zones with their identifying attributes and stored GeoJSON.
 */
export async function writeZonesGeoPackage(outputPath: string, zones: Pick<Zone, '_id' | 'agency_ids' | 'code' | 'geojson' | 'name'>[]) {
	//

	//
	// A. Accept both single features and collections. Keep each polygon's rings and holes together.

	const features = zones.flatMap((zone) => {
		if (!zone.geojson) throw new Error(`Zone ${zone._id} has no GeoJSON.`);

		const source = zone.geojson.type === 'FeatureCollection' ? zone.geojson.features : [zone.geojson];
		const polygons = source.map(feature => feature.geometry).filter(geometry => geometry.type === 'Polygon' || geometry.type === 'MultiPolygon');
		// Store the agency IDs as a JSON array in one text attribute to retain every association.
		const properties = { agency_ids: JSON.stringify(zone.agency_ids), code: zone.code, name: zone.name, zone_id: zone._id };

		return (polygons.length ? polygons : [null]).map(geometry => ({ geometry, properties, type: 'Feature' }));
	});

	//
	// B. Stage one FeatureCollection as GDAL's input

	const inputPath = path.resolve(outputPath, 'zones.geojson');
	await writeFile(inputPath, JSON.stringify({ features, type: 'FeatureCollection' }));

	//
	// C. Convert the GeoJSON to the GeoPackage

	try {
		Logger.info({ message: `Wrote ${features.length} features to zones.geojson. Starting GDAL validation and conversion.` });
		const conversionTimer = new Timer();
		await convertGeoPackage(inputPath);
		Logger.success(`Created zones.gpkg in ${conversionTimer.get()}.`);
	} finally {
		// The worker archives this directory. The intermediate GeoJSON can be removed once GDAL exits.
		await unlink(inputPath);
	}
}

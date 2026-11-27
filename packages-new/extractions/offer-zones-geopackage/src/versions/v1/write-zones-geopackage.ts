import { type Zone } from '@tmlmobilidade/go-types-offer';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { convertGeoPackage } from './convert-geopackage.js';

/* * */

/** Keep each stored polygonal feature and its holes together. Zones without a polygon retain their attributes. */
export async function writeZonesGeoPackage(outputPath: string, zones: Pick<Zone, '_id' | 'agency_ids' | 'code' | 'geojson' | 'name'>[]) {
	//

	//
	// A. Write the zone geometries to the GeoJSON

	const features = zones.flatMap((zone) => {
		const source = zone.geojson?.type === 'FeatureCollection' ? zone.geojson.features : zone.geojson ? [zone.geojson] : [];
		const polygons = source.map(feature => feature.geometry).filter(geometry => geometry.type === 'Polygon' || geometry.type === 'MultiPolygon');
		const properties = { agency_ids: JSON.stringify(zone.agency_ids), code: zone.code, name: zone.name, zone_id: zone._id };

		return (polygons.length ? polygons : [null]).map(geometry => ({ geometry, properties, type: 'Feature' }));
	});

	//
	// B. Save the GeoJSON for GDAL

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
		await unlink(inputPath);
	}
}

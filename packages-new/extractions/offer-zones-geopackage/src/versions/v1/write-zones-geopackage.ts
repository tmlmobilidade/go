import { type Zone } from '@tmlmobilidade/go-types-offer';
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
	// B. Convert the GeoJSON to the GeoPackage

	const inputPath = path.resolve(outputPath, 'zones.geojson');
	await writeFile(inputPath, JSON.stringify({ features, type: 'FeatureCollection' }));

	//
	// C. Convert the GeoJSON to the GeoPackage

	try {
		await convertGeoPackage(inputPath);
	} finally {
		await unlink(inputPath);
	}
}

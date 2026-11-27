import { type Zone } from '@tmlmobilidade/go-types-offer';
import { execFile } from 'node:child_process';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

/* * */

/** Keep each stored polygonal feature and its holes together. Zones without a polygon retain their attributes. */
export async function writeZonesGeoPackage(outputPath: string, zones: Pick<Zone, '_id' | 'agency_ids' | 'code' | 'geojson' | 'name'>[]) {
	const features = zones.flatMap((zone) => {
		const source = zone.geojson?.type === 'FeatureCollection' ? zone.geojson.features : zone.geojson ? [zone.geojson] : [];
		const polygons = source.map(feature => feature.geometry).filter(geometry => geometry.type === 'Polygon' || geometry.type === 'MultiPolygon');
		const properties = { agency_ids: JSON.stringify(zone.agency_ids), code: zone.code, name: zone.name, zone_id: zone._id };

		return (polygons.length ? polygons : [null]).map(geometry => ({ geometry, properties, type: 'Feature' }));
	});

	const inputPath = path.resolve(outputPath, 'zones.geojson');
	await writeFile(inputPath, JSON.stringify({ features, type: 'FeatureCollection' }));
	try {
		// GDAL mounts one output directory per process. Isolate each job and keep the worker heartbeat running.
		const converter = fileURLToPath(new URL('./convert-geopackage.js', import.meta.url));
		await promisify(execFile)(process.execPath, [converter, inputPath], {
			cwd: path.dirname(fileURLToPath(import.meta.resolve('gdal3.js'))),
		});
	} finally {
		await unlink(inputPath);
	}
}

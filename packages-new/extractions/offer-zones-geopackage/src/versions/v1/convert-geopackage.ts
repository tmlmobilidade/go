import { createRequire } from 'node:module';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/* * */

// The Node entry point reads the bundled WASM and projection data from the working directory.
const initGdal: typeof import('gdal3.js').default = createRequire(import.meta.url)('gdal3.js/node.js');
const inputPath = process.argv[2];
const gdal = await initGdal({ dest: path.dirname(inputPath), path: '.' });
const { datasets, errors } = await gdal.open(inputPath, ['DATE_AS_STRING=YES']);
const [dataset] = datasets;
if (!dataset) throw new Error(`Could not open zone geometries: ${errors.join(', ')}`);

try {
	// Reject invalid polygons before conversion so the export preserves the stored boundaries.
	const validation = await gdal.ogrinfo(dataset, [
		'-dialect', 'SQLite', '-features',
		'-sql', 'SELECT zone_id FROM zones WHERE geometry IS NOT NULL AND ST_IsValid(geometry) = 0 LIMIT 1',
	]) as { layers: { features: { properties: { zone_id: string } }[] }[] };
	const [invalid] = validation.layers[0].features;
	if (invalid) throw new Error(`Zone ${invalid.properties.zone_id} has invalid polygon geometry.`);

	const output = await gdal.ogr2ogr(dataset, ['-f', 'GPKG', '-nln', 'zones', '-nlt', 'MULTIPOLYGON', '-a_srs', 'EPSG:4326'], 'zones');

	// The layer accepts both XY and XYZ polygons. GDAL preserves Z values but declares the forced type as 2D.
	const db = new DatabaseSync(output.real);
	try {
		db.prepare('UPDATE gpkg_geometry_columns SET z = 2 WHERE table_name = ?').run('zones');
	} finally {
		db.close();
	}
} finally {
	await gdal.close(dataset);
}

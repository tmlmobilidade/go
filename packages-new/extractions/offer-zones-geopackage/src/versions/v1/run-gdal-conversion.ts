import initGdalJs from 'gdal3.js/node.js';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/* * */

interface ZoneValidationResult {
	layers: {
		features: { properties: { zone_id: string } }[]
	}[]
}

/* * */

/**
 * Validates the staged polygon features and writes the zones layer to zones.gpkg beside the input.
 * @throws If GDAL cannot open the input or finds an invalid polygon. The geometry error includes the zone ID.
 */
export async function runGdalConversion(inputPath: string): Promise<void> {
	//

	//
	// A. Open the GeoJSON and preserve date-like attribute strings as text

	const gdal = await initGdalJs({ dest: path.dirname(inputPath), path: '.' });
	const { datasets: [zones], errors } = await gdal.open(inputPath, ['DATE_AS_STRING=YES']);
	if (!zones) throw new Error(`Could not open zone geometries: ${errors.join(', ')}`);

	try {
		//
		// B. Report the first invalid boundary before writing. Null geometries represent zones without polygons.

		const validation = await gdal.ogrinfo(zones, [
			'-dialect', 'SQLite',
			'-features',
			'-sql', 'SELECT zone_id FROM zones WHERE geometry IS NOT NULL AND ST_IsValid(geometry) = 0 LIMIT 1',
		]) as ZoneValidationResult;

		const [invalidZone] = validation.layers[0].features;
		if (invalidZone) throw new Error(`Zone ${invalidZone.properties.zone_id} has invalid polygon geometry.`);

		//
		// C. Store polygons and multipart polygons in one MultiPolygon layer.
		// The GeoJSON coordinates are already WGS 84, so GDAL assigns EPSG:4326 without transforming them.

		const output = await gdal.ogr2ogr(zones, [
			'-f', 'GPKG',
			'-nln', 'zones',
			'-nlt', 'MULTIPOLYGON',
			'-a_srs', 'EPSG:4326',
		], 'zones');

		//
		// D. Update the layer metadata

		// GDAL preserves elevations but declares the layer as 2D. Mark Z as optional for both XY and XYZ geometries.
		using db = new DatabaseSync(output.real);
		db.prepare('UPDATE gpkg_geometry_columns SET z = 2 WHERE table_name = ?').run('zones');
	} finally {
		await gdal.close(zones);
	}
}


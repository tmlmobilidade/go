/* * */

import { Files, getTmpWorkdirPath } from '@tmlmobilidade/go-utils-files';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';

import { applyPatternIdsAsShapeIds } from './shapes.js';

/* * */

const SHAPES_CSV = 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\nS1,38.7,-9.1,0\nS1,38.8,-9.2,1\nS2,38.9,-9.3,0\nS9,39.0,-9.4,0';

/* * */

/**
 * Builds a zip archive from the given CSV strings, on disk, and unzips it again,
 * so that the checks below run against a real zip archive.
 */
async function buildGtfsZipInstance(workdirPath: string, files: Record<string, string>) {
	const zipContent = await Files.zip(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, Buffer.from(content)])));
	const zipFilePath = join(workdirPath, 'source.zip');
	fs.writeFileSync(zipFilePath, zipContent);
	return await Files.unzip(zipFilePath);
}

/**
 * Generates the zip archive and reads an entry back out of it, which is what
 * consumes the read streams that the rewrite adds to the archive.
 */
async function readGeneratedEntries(workdirPath: string, zipInstance: Awaited<ReturnType<typeof buildGtfsZipInstance>>) {
	const generatedZipContent = await zipInstance.generateAsync({ type: 'nodebuffer' });
	const generatedZipFilePath = join(workdirPath, 'generated.zip');
	fs.writeFileSync(generatedZipFilePath, generatedZipContent);
	const generatedZipInstance = await Files.unzip(generatedZipFilePath);
	return {
		shapesCsvString: await generatedZipInstance.file('shapes.txt')?.async('string'),
		tripsCsvString: await generatedZipInstance.file('trips.txt')?.async('string'),
	};
}

/* * */

async function run() {
	//

	const rootWorkdirPath = getTmpWorkdirPath(undefined, true);

	try {
		//

		//
		// Every trip carries a pattern_id, so both files are rewritten. Trips sharing
		// a pattern (T2 and T3) collapse onto the same shape, and the shape that no
		// trip references (S9) passes through untouched.

		const renameWorkdirPath = join(rootWorkdirPath, 'rename');
		fs.mkdirSync(renameWorkdirPath);

		const renameZipInstance = await buildGtfsZipInstance(renameWorkdirPath, {
			'shapes.txt': SHAPES_CSV,
			'trips.txt': 'trip_id,pattern_id,shape_id\nT1,P1,S1\nT2,P2,S2\nT3,P2,S2',
		});

		assert.equal(await applyPatternIdsAsShapeIds(renameZipInstance, renameWorkdirPath), true, 'A feed with pattern_id values should be rewritten');

		const renamed = await readGeneratedEntries(renameWorkdirPath, renameZipInstance);

		assert.equal(renamed.tripsCsvString, 'trip_id,pattern_id,shape_id\r\nT1,P1,P1\r\nT2,P2,P2\r\nT3,P2,P2\r\n');
		assert.equal(renamed.shapesCsvString, 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\r\nP1,38.7,-9.1,0\r\nP1,38.8,-9.2,1\r\nP2,38.9,-9.3,0\r\nS9,39.0,-9.4,0\r\n');

		//
		// A feed without the pattern_id extension column is left untouched.

		const withoutWorkdirPath = join(rootWorkdirPath, 'without');
		fs.mkdirSync(withoutWorkdirPath);

		const withoutZipInstance = await buildGtfsZipInstance(withoutWorkdirPath, {
			'shapes.txt': SHAPES_CSV,
			'trips.txt': 'trip_id,shape_id\nT1,S1\nT2,S2',
		});

		assert.equal(await applyPatternIdsAsShapeIds(withoutZipInstance, withoutWorkdirPath), false, 'A feed without pattern_id should be a no-op');

		const untouched = await readGeneratedEntries(withoutWorkdirPath, withoutZipInstance);

		assert.equal(untouched.tripsCsvString, 'trip_id,shape_id\nT1,S1\nT2,S2');
		assert.equal(untouched.shapesCsvString, SHAPES_CSV);

		//
		// A feed where every shape_id already equals its pattern_id is left untouched,
		// so that an unchanged plan is never re-uploaded.

		const alignedWorkdirPath = join(rootWorkdirPath, 'aligned');
		fs.mkdirSync(alignedWorkdirPath);

		const alignedZipInstance = await buildGtfsZipInstance(alignedWorkdirPath, {
			'shapes.txt': SHAPES_CSV,
			'trips.txt': 'trip_id,pattern_id,shape_id\nT1,S1,S1\nT2,S2,S2',
		});

		assert.equal(await applyPatternIdsAsShapeIds(alignedZipInstance, alignedWorkdirPath), false, 'An already aligned feed should be a no-op');

		//
		// The rewrite streams in batches, so check a feed larger than one batch.

		const largeWorkdirPath = join(rootWorkdirPath, 'large');
		fs.mkdirSync(largeWorkdirPath);

		const largeRowCount = 25_000;
		const largeTripsRows = Array.from({ length: largeRowCount }, (_, index) => `T${index},P${index},S${index}`);
		const largeShapesRows = Array.from({ length: largeRowCount }, (_, index) => `S${index},38.7,-9.1,0`);

		const largeZipInstance = await buildGtfsZipInstance(largeWorkdirPath, {
			'shapes.txt': `shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\n${largeShapesRows.join('\n')}`,
			'trips.txt': `trip_id,pattern_id,shape_id\n${largeTripsRows.join('\n')}`,
		});

		assert.equal(await applyPatternIdsAsShapeIds(largeZipInstance, largeWorkdirPath), true);

		const large = await readGeneratedEntries(largeWorkdirPath, largeZipInstance);
		const largeTripsLines = large.tripsCsvString.trimEnd().split('\r\n');
		const largeShapesLines = large.shapesCsvString.trimEnd().split('\r\n');

		assert.equal(largeTripsLines.length, largeRowCount + 1, 'Every trip row should survive the batched encoding');
		assert.equal(largeShapesLines.length, largeRowCount + 1, 'Every shape row should survive the batched encoding');
		assert.equal(largeTripsLines.at(-1), `T${largeRowCount - 1},P${largeRowCount - 1},P${largeRowCount - 1}`);
		assert.equal(largeShapesLines.at(-1), `P${largeRowCount - 1},38.7,-9.1,0`);

		console.log('All checks passed.');

		//
	} finally {
		fs.rmSync(rootWorkdirPath, { force: true, recursive: true });
	}

	//
}

/* * */

await run();

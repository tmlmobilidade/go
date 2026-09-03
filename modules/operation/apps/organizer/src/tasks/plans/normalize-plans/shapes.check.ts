/* * */

import assert from 'node:assert/strict';

import { applyPatternIdsAsShapeIds, ShapeIdConflictError } from './shapes.js';

/* * */

const SHAPES_CSV = 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\nS1,38.7,-9.1,0\nS1,38.8,-9.2,1\nS2,38.9,-9.3,0\nS3,39.0,-9.4,0';

/* * */

async function run() {
	//

	//
	// A feed without the pattern_id extension column is left untouched.

	const withoutPatternIds = await applyPatternIdsAsShapeIds('trip_id,shape_id\nT1,S1\nT2,S2', SHAPES_CSV);

	assert.equal(withoutPatternIds, null, 'Feeds without pattern_id should be a no-op');

	//
	// A one-to-one relation renames the shape in both files, and shapes that
	// no trip references (S3) pass through untouched.

	const renamed = await applyPatternIdsAsShapeIds('trip_id,pattern_id,shape_id\nT1,P1,S1\nT2,P2,S2', SHAPES_CSV);

	assert.ok(renamed, 'A valid relation should produce updated files');
	assert.equal(renamed.tripsCsvString, 'trip_id,pattern_id,shape_id\r\nT1,P1,P1\r\nT2,P2,P2');
	assert.equal(renamed.shapesCsvString, 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\r\nP1,38.7,-9.1,0\r\nP1,38.8,-9.2,1\r\nP2,38.9,-9.3,0\r\nS3,39.0,-9.4,0');

	//
	// One shape claimed by two patterns cannot be renamed without duplicating it.

	await assert.rejects(
		applyPatternIdsAsShapeIds('trip_id,pattern_id,shape_id\nT1,P1,S1\nT2,P2,S1', SHAPES_CSV),
		ShapeIdConflictError,
		'One shape_id with two pattern_ids should conflict',
	);

	//
	// Renaming S1 to S3 would land on top of the untouched S3 shape.

	await assert.rejects(
		applyPatternIdsAsShapeIds('trip_id,pattern_id,shape_id\nT1,S3,S1', SHAPES_CSV),
		ShapeIdConflictError,
		'A rename colliding with an untouched shape_id should conflict',
	);

	console.log('All checks passed.');

	//
}

/* * */

await run();

/* * */

import { Files } from '@tmlmobilidade/go-utils-files';
import Papa from 'papaparse';

/* * */

type CsvRow = Record<string, string>;

interface ApplyPatternIdsAsShapeIdsResult {
	shapesCsvString: string
	tripsCsvString: string
}

/* * */

/**
 * Thrown when the `shape_id` to `pattern_id` relation is not one-to-one,
 * which means the rewrite would merge or drop shapes and corrupt the feed.
 */
export class ShapeIdConflictError extends Error {}

/* * */

/**
 * Rewrites the `shape_id` values of trips.txt and shapes.txt to match the
 * `pattern_id` of each trip. The `pattern_id` column is a TML extension,
 * so feeds without it are left untouched.
 * @returns The updated CSV strings, or null if there is nothing to rewrite.
 * @throws ShapeIdConflictError if the rewrite would not be reversible.
 */
export async function applyPatternIdsAsShapeIds(tripsCsvString: string, shapesCsvString: string): Promise<ApplyPatternIdsAsShapeIdsResult | null> {
	//

	const tripsRows = await Files.parseCsv<CsvRow>(tripsCsvString, {});
	const shapesRows = await Files.parseCsv<CsvRow>(shapesCsvString, {});

	//
	// Build the shape_id to pattern_id relation, keeping only trips that have both values.
	// Trips with a pattern_id but no shape_id are left alone, otherwise they would end up
	// referencing a shape that does not exist in shapes.txt.

	const shapeIdToPatternId = new Map<string, string>();
	const patternIdToShapeId = new Map<string, string>();

	for (const tripRow of tripsRows) {
		//

		const patternId = tripRow.pattern_id?.trim();
		const shapeId = tripRow.shape_id?.trim();

		if (!patternId || !shapeId) continue;

		const knownPatternId = shapeIdToPatternId.get(shapeId);
		const knownShapeId = patternIdToShapeId.get(patternId);

		if (knownPatternId && knownPatternId !== patternId) {
			throw new ShapeIdConflictError(`Shape "${shapeId}" is used by patterns "${knownPatternId}" and "${patternId}".`);
		}

		if (knownShapeId && knownShapeId !== shapeId) {
			throw new ShapeIdConflictError(`Pattern "${patternId}" is used by shapes "${knownShapeId}" and "${shapeId}".`);
		}

		shapeIdToPatternId.set(shapeId, patternId);
		patternIdToShapeId.set(patternId, shapeId);

		//
	}

	if (shapeIdToPatternId.size === 0) return null;

	//
	// Make sure the renamed shapes do not land on top of shapes that are kept as-is.

	const originalShapeIdByResultingShapeId = new Map<string, string>();

	for (const shapesRow of shapesRows) {
		//

		const shapeId = shapesRow.shape_id;

		if (!shapeId) continue;

		const resultingShapeId = shapeIdToPatternId.get(shapeId) ?? shapeId;
		const collidingShapeId = originalShapeIdByResultingShapeId.get(resultingShapeId);

		if (collidingShapeId && collidingShapeId !== shapeId) {
			throw new ShapeIdConflictError(`Shapes "${collidingShapeId}" and "${shapeId}" would both become "${resultingShapeId}".`);
		}

		originalShapeIdByResultingShapeId.set(resultingShapeId, shapeId);

		//
	}

	//
	// Apply the rewrite to both files.

	const updatedTripsRows = tripsRows.map((tripRow) => {
		const patternId = shapeIdToPatternId.get(tripRow.shape_id?.trim());
		return patternId ? { ...tripRow, shape_id: patternId } : tripRow;
	});

	const updatedShapesRows = shapesRows.map((shapesRow) => {
		const patternId = shapeIdToPatternId.get(shapesRow.shape_id);
		return patternId ? { ...shapesRow, shape_id: patternId } : shapesRow;
	});

	return {
		shapesCsvString: Papa.unparse(updatedShapesRows),
		tripsCsvString: Papa.unparse(updatedTripsRows),
	};

	//
}

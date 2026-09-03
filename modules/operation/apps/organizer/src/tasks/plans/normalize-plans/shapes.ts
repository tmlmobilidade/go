/* * */

import { GtfsStrictV30Shapes, GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { BatchWriter, streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';

/**
 * Rewrites the `shape_id` values of trips.txt and shapes.txt to match the `pattern_id`
 * of each trip. Both files are streamed row by row through the given working directory,
 * since a GTFS feed can hold millions of rows.
 * The `pattern_id` column is a TML extension, so feeds without it are left untouched.
 * The rewritten files are added to the archive as read streams, so the working directory
 * must outlive the archive generation.
 * @returns True if the zip archive was updated.
 */
export async function applyPatternIdsAsShapeIds(workdirPath: string): Promise<void> {
	//

	//
	// Set up a map to collect the shape_id -> pattern_id relationships.

	const shapeIdToPatternIdMap = new Map<string, string>();

	//
	// Prepare the output directory.

	const outputFilePath = join(workdirPath, 'output');

	try {
		fs.rmSync(outputFilePath, { force: true, recursive: true });
		fs.mkdirSync(outputFilePath, { recursive: true });
		Logger.success(`Prepared output directory at "${outputFilePath}".`, 1);
	} catch (error) {
		Logger.error({ error, message: `Error preparing output path "${outputFilePath}".` });
		process.exit(1);
	}

	//
	// Initialize the writers for the trips.txt and shapes.txt files.

	const tripsWriter = new BatchWriter({
		batch_size: 100_000,
		insertFn: async (data) => {
			const dirPath = `${outputFilePath}/trips.txt`;
			const fileAlreadyExists = fs.existsSync(dirPath);
			let csvData = Papa.unparse(data, { header: !fileAlreadyExists, newline: '\n', skipEmptyLines: 'greedy' });
			if (fileAlreadyExists) csvData = '\n' + csvData;
			fs.appendFileSync(dirPath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'trips',
	});

	const shapesWriter = new BatchWriter({
		batch_size: 100_000,
		insertFn: async (data) => {
			const dirPath = `${outputFilePath}/shapes.txt`;
			const fileAlreadyExists = fs.existsSync(dirPath);
			let csvData = Papa.unparse(data, { header: !fileAlreadyExists, newline: '\n', skipEmptyLines: 'greedy' });
			if (fileAlreadyExists) csvData = '\n' + csvData;
			fs.appendFileSync(dirPath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'shapes',
	});

	//
	// Parse the trips.txt file, collecting the shape_id to pattern_id mapping.

	const tripsTimer = new Timer();

	Logger.info({ message: 'Reading zip entry "trips.txt"...' });

	const parseEachTripsRow = async (data: GtfsStrictV30Trips) => {
		// Skip if this row does not have a pattern_id
		if (!('pattern_id' in data && typeof data.pattern_id === 'string')) throw new Error('Row does not have a pattern_id');
		// Get the current shape_id and pattern_id values
		const currentShapeId = data.shape_id;
		const currentPatternId = data.pattern_id;
		// Check if the values are different
		if (currentShapeId === currentPatternId) throw new Error(`Shape ID "${currentShapeId}" and pattern ID "${currentPatternId}" are already the same`);
		// Update the map and write the row to the output file
		shapeIdToPatternIdMap.set(currentShapeId, currentPatternId);
		tripsWriter.write({ ...data, shape_id: currentPatternId });
	};

	await streamCsvFile(`${workdirPath}/extracted/trips.txt`, parseEachTripsRow);

	tripsWriter.flush();

	Logger.success(`Finished processing "trips.txt" in ${tripsTimer.get()}.`, 1);

	//
	// Parse the shapes.txt file, writing the rows to the output file.

	const shapesTimer = new Timer();

	Logger.info({ message: 'Reading zip entry "shapes.txt"...' });

	const parseEachShapesRow = async (data: GtfsStrictV30Shapes) => {
		// Get the current shape_id and pattern_id values
		const currentShapeId = data.shape_id;
		const currentPatternId = shapeIdToPatternIdMap.get(currentShapeId);
		// Check if the values are different
		if (currentShapeId === currentPatternId) throw new Error(`Shape ID "${currentShapeId}" and pattern ID "${currentPatternId}" are already the same`);
		// Update the map and write the row to the output file
		shapesWriter.write({ ...data, shape_id: currentPatternId });
	};

	await streamCsvFile(`${workdirPath}/extracted/shapes.txt`, parseEachShapesRow);

	shapesWriter.flush();

	Logger.success(`Finished processing "shapes.txt" in ${shapesTimer.get()}.`, 1);

	//
	// Replace the original trips.txt and shapes.txt files with the new ones.

	fs.rmSync(`${workdirPath}/extracted/trips.txt`, { force: true });
	fs.rmSync(`${workdirPath}/extracted/shapes.txt`, { force: true });

	fs.renameSync(`${outputFilePath}/trips.txt`, `${workdirPath}/extracted/trips.txt`);
	fs.renameSync(`${outputFilePath}/shapes.txt`, `${workdirPath}/extracted/shapes.txt`);

	Logger.success(`Replaced original trips.txt and shapes.txt files with the new ones.`, 1);

	//
}

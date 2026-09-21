/* * */

import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

import { type OperationPostersV1Context } from '../types/context.js';

/* * */

interface PosterWriterOptions<T> {
	batch_size?: number
	fields?: Extract<keyof T, string>[]
	include_bom?: boolean
	newline?: string
	quotes?: Papa.UnparseConfig['quotes']
}

/* * */

export function initOperationPostersV1Context(runId: string, workdirPath: string): OperationPostersV1Context {
	//
	// A. Setup the working directory

	fs.mkdirSync(workdirPath, { recursive: true });
	const workdir: OperationPostersV1Context['workdir'] = {
		path: workdirPath,
		remove: () => fs.rmSync(workdirPath, { force: true, recursive: true }),
	};

	//
	// B. Setup the batch writers

	function createWriter<T extends object>(filename: string, options: PosterWriterOptions<T> = {}): BatchWriter<T> {
		const filePath = path.join(workdir.path, filename);
		const newline = options.newline ?? '\n';
		return new BatchWriter<T>({
			batch_size: options.batch_size ?? 100_000,
			insertFn: async (data) => {
				const fileAlreadyExists = fs.existsSync(filePath);
				const csvData = Papa.unparse(options.fields ? { data, fields: options.fields } : data, {
					header: !fileAlreadyExists,
					newline,
					quotes: options.quotes,
					skipEmptyLines: 'greedy',
				});
				const prefix = fileAlreadyExists ? newline : options.include_bom ? '\uFEFF' : '';
				fs.appendFileSync(filePath, prefix + csvData, { encoding: 'utf-8', flush: true });
			},
			max_retries: 0,
			title: filename,
		});
	}

	const calendarAssignmentsFields = ['day_type_id', 'service_id'] as const;
	const calendarExtFields = ['service_id', 'index', 'comment'] as const;
	const dayTypesFields = ['day_type_id', 'name', 'sequence_number', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
	const stopsToCanvasFields = ['stop_id', 'canvas_profile', 'direction_id'] as const;

	const writers: OperationPostersV1Context['writers'] = {
		agency: createWriter('agency.txt', {
			batch_size: 10_000,
			fields: ['agency_email', 'agency_fare_url', 'agency_id', 'agency_lang', 'agency_name', 'agency_phone', 'agency_timezone', 'agency_url'],
		}),
		calendar_assignments_ext: createWriter('calendar_assignmentsExt.txt', {
			fields: [...calendarAssignmentsFields],
			quotes: value => !calendarAssignmentsFields.some(field => field === value),
		}),
		calendar_dates: createWriter('calendar_dates.txt'),
		calendar_ext: createWriter('calendarExt.txt', {
			fields: [...calendarExtFields],
			quotes: value => !calendarExtFields.some(field => field === value),
		}),
		calendars: createWriter('calendar.txt'),
		day_types_ext: createWriter('day_typesExt.txt', {
			fields: [...dayTypesFields],
			quotes: (value, columnIndex) => columnIndex < 2 && !dayTypesFields.some(field => field === value),
		}),
		feed_info: createWriter('feed_info.txt', { batch_size: 10_000 }),
		routes: createWriter('routes.txt'),
		routes_to_canvas_ext: createWriter('routesToCanvasExt.txt', {
			fields: ['route_id', 'canvas_profile', 'direction_id'],
			include_bom: true,
			newline: '\r\n',
		}),
		shapes: createWriter('shapes.txt', { batch_size: 10_000 }),
		shapes_ext: createWriter('shapesExt.txt', {
			batch_size: 10_000,
			fields: ['shape_id', 'sequence_number', 'priority_number', 'note', 'direction_description', 'via_text'],
			include_bom: true,
			newline: '\r\n',
		}),
		stop_times: createWriter('stop_times.txt'),
		stop_times_ext: createWriter('stop_timesExt.txt', {
			fields: ['trip_id', 'stop_id', 'stop_sequence', 'billboard_importance', 'billboard_alignment_id', 'route_stop_sequence', 'index', 'note'],
			include_bom: true,
			newline: '\r\n',
		}),
		stops: createWriter('stops.txt'),
		stops_to_canvas_ext: createWriter('stopsToCanvasExt.txt', {
			fields: [...stopsToCanvasFields],
			include_bom: true,
			newline: '\r\n',
			quotes: (value, columnIndex) => columnIndex === 0 && !stopsToCanvasFields.some(field => field === value),
		}),
		trips: createWriter('trips.txt', { batch_size: 10_000 }),
	};

	//
	// C. Return the export context

	return { run_id: runId, workdir, writers };
}

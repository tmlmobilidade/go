/* * */

import { type OriginalRouteType } from '@/original-route.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { routes } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Route, RouteSchema } from '@tmlmobilidade/types';

/* * */

interface LineResponse {
	_id: string
	code: string
}

interface LinesApiResponse {
	data: LineResponse[]
}

/* * */

export async function seedRoutesFromGoV1() {
	try {
		//

		const COOKIE = process.env.GO_AUTH_COOKIE || '';

		//
		// Download lines from GO v1 to map old IDs to codes

		const originalLinesResponse = await fetch('https://go.carrismetropolitana.pt/api/lines');

		const originalLinesData = await originalLinesResponse.json() as LineResponse[];

		// Create map: old line ID -> line code
		const oldLineIdToCode = new Map(
			originalLinesData.map(l => [String(l._id), String(l.code)]),
		);

		console.log(`Loaded ${oldLineIdToCode.size} lines from GO v1`);

		//
		// Download lines from local API to get new IDs

		const newLinesResponse = await fetch('http://localhost:52010/lines', {
			headers: {
				Cookie: COOKIE, // 'session_token=abc',
			},
		});
		const newLinesResponseData = await newLinesResponse.json() as LinesApiResponse;
		const newLinesData = newLinesResponseData.data;

		// Create map: line code -> new line ID
		const lineCodeToNewId = new Map(
			newLinesData.map(l => [String(l.code), String(l._id)]),
		);

		console.log(`Loaded ${lineCodeToNewId.size} lines from local API`);

		//
		// Download and prepare GO routes data

		const originalRoutesResponse = await fetch('https://go.carrismetropolitana.pt/api/routes');

		const originalRoutesData = await originalRoutesResponse.json() as OriginalRouteType[];

		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		let skipped = 0;
		const preparedRoutes = originalRoutesData.map((originalRoute) => {
			// Transform old line ID to new ID
			const oldLineId = String(originalRoute.parent_line);
			const lineCode = oldLineIdToCode.get(oldLineId);
			let newLineId: null | string = null;

			if (lineCode) {
				newLineId = lineCodeToNewId.get(lineCode) ?? null;
				if (!newLineId) {
					console.log(`No new line ID found for code ${lineCode} (route ${originalRoute.code})`);
				}
			}

			if (!newLineId) {
				console.log('Skipping route without valid line:', originalRoute);
				skipped += 1;
				return null;
			}

			const parsed = RouteSchema.safeParse({
				_id: generateRandomString(),
				code: normalizeCode(originalRoute.code),
				created_at: now,
				created_by: 'system',
				line_id: newLineId,
				name: normalizeName(originalRoute.name),
				path_type: 'base',
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				console.log('Skipping route with validation error:', { code: originalRoute.code, error: parsed.error.issues });
				skipped += 1;
				return null;
			}

			return parsed.data;
		}).filter(Boolean) as Route[];

		console.log(`Prepared ${preparedRoutes.length} routes${skipped ? ` (skipped ${skipped})` : ''}`);

		//
		// Insert routes into DB

		await routes.insertMany(preparedRoutes, { unsafe: true });
		console.log(`Inserted ${preparedRoutes.length} routes`);

		//
	}
	catch (err) {
		console.error('Error importing routes:', err);
		process.exit(1);
	}
}

/* * */

function normalizeCode(value: unknown): string {
	const code = String(value ?? '').trim();
	return code.length > 10 ? code.slice(0, 10) : code;
}

function normalizeName(value: unknown): string {
	const name = String(value ?? '').trim();
	return name.length > 50 ? name.slice(0, 50) : name;
}

/* * */

import { type OriginalLineType } from '@/original-line.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { lines } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { INTERCHANGE_MODE, type Line, LineSchema, TransportType, TransportTypeValues } from '@tmlmobilidade/types';

/* * */

interface FareResponse {
	_id: string
	code: string
}

interface FaresApiResponse {
	data: FareResponse[]
}

interface TypologyResponse {
	_id: string
	code: string
}

interface TypologiesApiResponse {
	data: TypologyResponse[]
}

/* * */

export async function seedLinesFromGoV1() {
	try {
		//

		const COOKIE = process.env.GO_AUTH_COOKIE || '';

		//
		// Download and prepare agencies data

		const originalAgenciesResponse = await fetch('https://go.carrismetropolitana.pt/api/agencies');
		const originalAgenciesData = await originalAgenciesResponse.json() as { _id: { $oid: string }, code: string }[];

		// Create a map of agency _id.$oid to agency code
		const agencyIdToCode = new Map<string, string>();
		for (const agency of originalAgenciesData) {
			const oid = extractOid(agency._id);
			if (oid && agency.code) {
				agencyIdToCode.set(oid, agency.code);
			}
		}

		console.log(`Loaded ${agencyIdToCode.size} agencies`);

		//
		// Download fares from GO v1 to map old IDs to codes

		const originalFaresResponse = await fetch('https://go.carrismetropolitana.pt/api/fares');

		const originalFaresData = await originalFaresResponse.json() as FareResponse[];

		// Create map: old fare ID -> fare code
		const oldFareIdToCode = new Map(
			originalFaresData.map(f => [String(f._id), String(f.code)]),
		);

		console.log(`Loaded ${oldFareIdToCode.size} fares from GO v1`);

		//
		// Download fares from local API to get new IDs

		const newFaresResponse = await fetch('http://localhost:52009/fares', {
			headers: {
				Cookie: COOKIE, // 'session_token=abc',
			},
		});
		const newFaresResponseData = await newFaresResponse.json() as FaresApiResponse;
		const newFaresData = newFaresResponseData.data;

		// Create map: fare code -> new fare ID
		const fareCodeToNewId = new Map(
			newFaresData.map(f => [String(f.code), String(f._id)]),
		);

		console.log(`Loaded ${fareCodeToNewId.size} fares from local API`);

		//
		// Download typologies from GO v1 to map old IDs to codes

		const originalTypologiesResponse = await fetch('https://go.carrismetropolitana.pt/api/typologies');

		const originalTypologiesData = await originalTypologiesResponse.json() as TypologyResponse[];

		// Create map: old typology ID -> typology code
		const oldTypologyIdToCode = new Map(
			originalTypologiesData.map(t => [String(t._id), String(t.code)]),
		);

		console.log(`Loaded ${oldTypologyIdToCode.size} typologies from GO v1`);

		//
		// Download typologies from local API to get new IDs

		const newTypologiesResponse = await fetch('http://localhost:52010/typologies', {
			headers: {
				Cookie: COOKIE,
			},
		});
		const newTypologiesResponseData = await newTypologiesResponse.json() as TypologiesApiResponse;
		const newTypologiesData = newTypologiesResponseData.data;

		// Create map: typology code -> new typology ID
		const typologyCodeToNewId = new Map(
			newTypologiesData.map(t => [String(t.code), String(t._id)]),
		);

		console.log(`Loaded ${typologyCodeToNewId.size} typologies from local API`);

		//
		// Download and prepare GO lines data

		const originalLinesResponse = await fetch('https://go.carrismetropolitana.pt/api/lines');

		const originalLinesData = await originalLinesResponse.json() as OriginalLineType[];

		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		let skipped = 0;
		const preparedLines = originalLinesData.map((originalLine) => {
			// Map agency _id to agency code
			const agencyOid = extractOid(originalLine.agency);
			const agency_id = agencyOid ? agencyIdToCode.get(agencyOid) : null;

			if (!agency_id) {
				console.log('Skipping line without valid agency:', originalLine);
				skipped += 1;
				return null;
			}

			// Transform old fare IDs to new IDs
			const oldPrepaidFareId = extractOid(originalLine.prepaid_fare);
			const oldOnboardFareIds = normalizeOidArray(originalLine.onboard_fares);

			// Map old IDs to new IDs via fare codes
			let newPrepaidFareId: null | string = null;
			if (oldPrepaidFareId) {
				const fareCode = oldFareIdToCode.get(oldPrepaidFareId);
				if (fareCode) {
					newPrepaidFareId = fareCodeToNewId.get(fareCode) ?? null;
					if (!newPrepaidFareId) {
						console.log(`No new fare ID found for code ${fareCode} (line ${originalLine.code})`);
					}
				}
			}

			const newOnboardFareIds: string[] = [];
			for (const oldId of oldOnboardFareIds) {
				const fareCode = oldFareIdToCode.get(oldId);
				if (fareCode) {
					const newId = fareCodeToNewId.get(fareCode);
					if (newId) {
						newOnboardFareIds.push(newId);
					}
					else {
						console.log(`No new fare ID found for code ${fareCode} (line ${originalLine.code})`);
					}
				}
			}

			// Transform old typology ID to new ID
			const oldTypologyId = extractOid(originalLine.typology);
			let newTypologyId: null | string = null;
			if (oldTypologyId) {
				const typologyCode = oldTypologyIdToCode.get(oldTypologyId);
				if (typologyCode) {
					newTypologyId = typologyCodeToNewId.get(typologyCode) ?? null;
					if (!newTypologyId) {
						console.log(`No new typology ID found for code ${typologyCode} (line ${originalLine.code})`);
					}
				}
			}

			const parsed = LineSchema.safeParse({
				_id: generateRandomString(),
				agency_id,
				code: normalizeCode(originalLine.code),
				created_at: now,
				created_by: 'system',
				interchange: normalizeInterchange(originalLine.interchange),
				is_circular_line: Boolean(originalLine.circular),
				is_locked: Boolean(originalLine.is_locked),
				is_school_line: Boolean(originalLine.school),
				name: originalLine.name,
				onboard_fare_ids: newOnboardFareIds,
				prepaid_fare_id: newPrepaidFareId,
				routes: [],
				transport_type: normalizeTransportType(originalLine.transport_type),
				typology: newTypologyId,
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				skipped += 1;
				return null;
			}

			return parsed.data;
		}).filter(Boolean) as Line[];

		console.log(`Prepared ${preparedLines.length} lines${skipped ? ` (skipped ${skipped})` : ''}`);

		//
		// Insert lines into DB

		await lines.insertMany(preparedLines, { unsafe: true });
		console.log(`Inserted ${preparedLines.length} lines`);

		//
	}
	catch (err) {
		console.error('Error importing lines:', err);
		process.exit(1);
	}
}

/* * */

function extractOid(value: unknown): null | string {
	if (!value) return null;
	if (typeof value === 'string') return value;
	if (typeof value === 'object') {
		const maybeOid = (value as { $oid?: unknown }).$oid;
		if (typeof maybeOid === 'string') return maybeOid;
		const nestedId = (value as { _id?: unknown })._id;
		if (nestedId && typeof nestedId === 'object') {
			const nestedOid = (nestedId as { $oid?: unknown }).$oid;
			if (typeof nestedOid === 'string') return nestedOid;
		}
	}
	return null;
}

function normalizeOidArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(extractOid).filter(Boolean) as string[];
}

function normalizeCode(value: unknown): string {
	const code = String(value ?? '').trim();
	return code.length > 10 ? code.slice(0, 10) : code;
}

function normalizeInterchange(value: unknown): Line['interchange'] {
	const interchange = String(value ?? '').trim();
	if (interchange === INTERCHANGE_MODE.NONE) return INTERCHANGE_MODE.NONE;
	if (interchange === INTERCHANGE_MODE.SAME_OPERATOR) return INTERCHANGE_MODE.SAME_OPERATOR;
	if (interchange === INTERCHANGE_MODE.CONFIGURED) return INTERCHANGE_MODE.CONFIGURED;
	return INTERCHANGE_MODE.NONE;
}

function normalizeTransportType(value: unknown): Line['transport_type'] {
	const transportType = String(value ?? '').trim();
	if ((TransportTypeValues).includes(transportType as TransportType)) {
		return transportType as Line['transport_type'];
	}
	return 'bus';
}

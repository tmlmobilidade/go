/* * */

import { type OriginalTypologyType } from '@/original-typology.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { typologies } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Typology, TypologySchema } from '@tmlmobilidade/types';

/* * */

interface FareResponse {
	_id: string
	code: string
}

interface FaresApiResponse {
	data: FareResponse[]
}

export async function seedFromGoV1() {
	try {
		//

		if (!process.env.GO_AUTH_COOKIE) {
			throw new Error('GO_AUTH_COOKIE environment variable is not set');
		}

		//

		const COOKIE = process.env.GO_AUTH_COOKIE;

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
		// Download and prepare GO typologies data

		const originalTypologiesResponse = await fetch('https://go.carrismetropolitana.pt/api/typologies');

		const originalTypologiesData = await originalTypologiesResponse.json() as OriginalTypologyType[];

		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		let skipped = 0;
		const preparedTypologies = originalTypologiesData.map((originalTypology) => {
			// Transform old fare IDs to new IDs
			const oldPrepaidFareId = extractOid(originalTypology.default_prepaid_fare);
			const oldOnboardFareIds = normalizeOidArray(originalTypology.default_onboard_fares);

			// Map old IDs to new IDs via fare codes
			let newPrepaidFareId: null | string = null;
			if (oldPrepaidFareId) {
				const fareCode = oldFareIdToCode.get(oldPrepaidFareId);
				if (fareCode) {
					newPrepaidFareId = fareCodeToNewId.get(fareCode) ?? null;
					if (!newPrepaidFareId) {
						console.log(`No new fare ID found for code ${fareCode} (typology ${originalTypology.code})`);
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
						console.log(`No new fare ID found for code ${fareCode} (typology ${originalTypology.code})`);
					}
				}
			}

			const parsed = TypologySchema.safeParse({
				_id: generateRandomString(),
				agency_ids: ['41', '42', '43', '44'],
				code: normalizeCode(originalTypology.code),
				color: String(originalTypology.color || '#000000').trim(),
				created_at: now,
				created_by: 'system',
				default_onboard_fare_ids: newOnboardFareIds,
				default_prepaid_fare_id: newPrepaidFareId,
				is_locked: Boolean(originalTypology.is_locked),
				name: normalizeName(originalTypology.name),
				text_color: String(originalTypology.text_color || '#FFFFFF').trim(),
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				console.log('Skipping typology with validation error:', { code: originalTypology.code, error: parsed.error.issues });
				skipped += 1;
				return null;
			}

			return parsed.data;
		}).filter(Boolean) as Typology[];

		console.log(`Prepared ${preparedTypologies.length} typologies${skipped ? ` (skipped ${skipped})` : ''}`);

		//
		// Insert typologies into DB

		await typologies.insertMany(preparedTypologies, { unsafe: true });
		console.log(`Inserted ${preparedTypologies.length} typologies`);

		//
	}
	catch (err) {
		console.error('Error importing typologies:', err);
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

function normalizeName(value: unknown): string {
	const name = String(value ?? '').trim();
	return name.length > 50 ? name.slice(0, 50) : name;
}

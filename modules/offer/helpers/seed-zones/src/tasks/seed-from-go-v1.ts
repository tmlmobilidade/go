/* * */

import { type OriginalZoneType } from '@/original-zone.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { zones } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { ZoneSchema } from '@tmlmobilidade/types';

/* * */

export async function seedFromGoV1() {
	try {
		//

		//
		// Download municipalities data (for fallback geojson)

		const originalMunicipalitiesResponse = await fetch('https://go.carrismetropolitana.pt/api/municipalities');

		const originalMunicipalitiesData = await originalMunicipalitiesResponse.json() as OriginalZoneType[];

		// Create a lookup map for municipalities by code
		const municipalitiesMap = new Map(
			originalMunicipalitiesData.map(m => [normalizeCode(m.code), m.geojson]),
		);

		console.log(`Loaded ${municipalitiesMap.size} municipalities for fallback geojson`);

		//
		// Download and prepare GO zones data

		const originalZonesResponse = await fetch('https://go.carrismetropolitana.pt/api/zones');

		const originalZonesData = await originalZonesResponse.json() as OriginalZoneType[];

		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		let skipped = 0;
		const preparedZones = originalZonesData.map((originalZone) => {
			// Check if geojson has empty coordinates and use municipality fallback
			let geojson = originalZone.geojson;
			if (originalZone.geojson?.geometry?.coordinates?.length === 0) {
				const municipalityGeojson = municipalitiesMap.get(normalizeCode(originalZone.code));
				if (municipalityGeojson) {
					console.log(`Using municipality geojson for zone ${originalZone.code}`);
					geojson = municipalityGeojson;
				}
				else {
					console.log(`No municipality geojson found for zone ${originalZone.code}`);
				}
			}

			const parsed = ZoneSchema.safeParse({
				_id: generateRandomString(),
				agency_ids: ['41', '42', '43', '44'],
				code: normalizeCode(originalZone.code),
				created_at: now,
				created_by: 'system',
				geojson: geojson,
				is_locked: Boolean(originalZone.is_locked),
				name: normalizeName(originalZone.name),
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				console.log(parsed.error.errors.map(e => ({ message: e.message, path: e.path })));
				skipped += 1;
				return null;
			}

			return parsed.data;
		}).filter(Boolean);

		console.log(`Prepared ${preparedZones.length} zones${skipped ? ` (skipped ${skipped})` : ''}`);

		//
		// Insert zones into DB

		await zones.insertMany(preparedZones, { unsafe: true });
		console.log(`Inserted ${preparedZones.length} zones`);

		//
	}
	catch (err) {
		console.error('Error importing zones:', err);
		process.exit(1);
	}
}

/* * */

function normalizeCode(value: unknown): string {
	const code = String(value ?? '').trim();
	return code.length > 30 ? code.slice(0, 30) : code;
}

function normalizeName(value: unknown): string {
	const name = String(value ?? '').trim();
	return name.length > 50 ? name.slice(0, 50) : name;
}

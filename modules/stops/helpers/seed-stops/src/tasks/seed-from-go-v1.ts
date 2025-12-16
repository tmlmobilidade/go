/* * */

import { type OriginalStopType } from '@/original-stop.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop, StopSchema } from '@tmlmobilidade/types';

/* * */

export async function seedFromGoV1() {
	try {
		//

		//
		// Download and prepare GO stops data

		const originalStopsResponse = await fetch('https://go.carrismetropolitana.pt/api/stops/public');
		const originalStopsData = await originalStopsResponse.json() as OriginalStopType[];

		const preparedStops = originalStopsData.map(originalStop => StopSchema.parse({
			_id: originalStop.code,
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: 'system',
			district_id: '',
			has_shelter: transformHasShelter(originalStop.has_shelter),
			is_deleted: false,
			is_locked: false,
			latitude: originalStop.latitude,
			legacy_id: originalStop.code,
			lifecycle_status: transformLifeCycleStatus(originalStop.operational_status),
			longitude: originalStop.longitude,
			municipality_id: '',
			name: originalStop.name,
			new_name: originalStop.name_new || null,
			short_name: '-----',
			tts_name: '',
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: 'system',
		}));

		console.log(`Prepared ${preparedStops.length} stops`);

		//
		// Download and prepare deleted stops

		const deletedStopsResponse = await fetch('https://go.carrismetropolitana.pt/api/stops/public-deleted');
		const deletedStopsData = await deletedStopsResponse.json() as OriginalStopType[];

		const preparedDeletedStops = deletedStopsData.map(deletedStop => StopSchema.parse({
			_id: deletedStop.code,
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: 'system',
			district_id: '',
			is_deleted: true,
			is_locked: false,
			latitude: deletedStop.latitude,
			legacy_id: deletedStop.code,
			lifecycle_status: 'voided',
			longitude: deletedStop.longitude,
			municipality_id: '',
			name: deletedStop.name,
			new_name: null,
			short_name: '-----',
			tts_name: '',
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: 'system',
		}));

		//
		// Insert stops into DB

		await stops.insertMany([...preparedStops, ...preparedDeletedStops]);
		console.log(`Inserted ${preparedStops.length} stops`);
		console.log(`Inserted ${preparedDeletedStops.length} deleted stops`);

		//
	}
	catch (err) {
		console.error('Error importing stops:', err);
		process.exit(1);
	}
}

/* * */

function transformLifeCycleStatus(value: string): Stop['lifecycle_status'] {
	if (value === 'ACTIVE') return 'active';
	if (value === 'INACTIVE') return 'inactive';
	if (value === 'PROVISIONAL') return 'provisional';
	if (value === 'VOIDED') return 'voided';
	return 'draft';
}

/* * */

function transformHasShelter(value: number | string): Stop['has_shelter'] {
	if (value === 'YES') return 'available';
	if (value === 'NO' || value === '0' || value === 0) return 'unavailable';
	return 'unknown';
}

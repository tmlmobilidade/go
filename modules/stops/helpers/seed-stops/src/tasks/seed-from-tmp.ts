/* * */

import { Dates } from '@tmlmobilidade/dates';
import { stops } from '@tmlmobilidade/interfaces';
import { StopSchema } from '@tmlmobilidade/types';
import Papa from 'papaparse';

/* * */

interface UtXStopType {
	stop_id: string
	stop_lat: string
	stop_lon: string
	stop_name: string
	zone_id: string
}

/* * */

export async function seedFromTmp() {
	try {
		//

		//
		// Download and prepare GO stops data

		const ut1StopsResponse = await fetch('https://storage.carrismetropolitana.pt/static/test/tmp/ut1/stops.txt');
		const ut1StopsText = await ut1StopsResponse.text();

		const ut1StopsData = Papa.parse<UtXStopType>(ut1StopsText, { header: true });

		const preparedStops = ut1StopsData.data.map((originalStop) => {
			const stop = StopSchema.safeParse({
				_id: originalStop.stop_id,
				created_at: Dates.now('Europe/Lisbon').unix_timestamp,
				created_by: 'system',
				district_id: '',
				is_deleted: false,
				is_locked: false,
				latitude: Number(originalStop.stop_lat),
				legacy_id: originalStop.stop_id,
				lifecycle_status: 'active',
				longitude: Number(originalStop.stop_lon),
				municipality_id: '',
				name: originalStop.stop_name || 'unnamed',
				new_name: '',
				short_name: '',
				tts_name: '',
				updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
				updated_by: 'system',
			});
			if (stop.success) return stop.data;
		}).filter(Boolean);

		console.log(`Prepared ${preparedStops.length} stops`);

		//
		// Insert stops into DB

		await stops.insertMany(preparedStops);
		console.log(`Inserted ${preparedStops.length} stops`);

		//
	}
	catch (err) {
		console.error('Error importing stops:', err);
		process.exit(1);
	}
}

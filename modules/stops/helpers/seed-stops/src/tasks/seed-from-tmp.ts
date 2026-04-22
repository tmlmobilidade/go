/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { stops } from '@tmlmobilidade/interfaces';
import { Stop, StopId, StopSchema } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import fs from 'node:fs';
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

		const jsonFile = `/Users/joao/Developer/tmlmobilidade/go/modules/stops/helpers/seed-stops/src/tasks/tmp-stops.json`;

		let preparedStops = [];

		if (fs.existsSync(jsonFile)) {
			const fileData = fs.readFileSync(jsonFile, 'utf-8');
			preparedStops = JSON.parse(fileData);
			console.log(`Loaded ${preparedStops.length} existing stops from JSON file`);
			ut1StopsData.data = ut1StopsData.data.filter(stop => !preparedStops.some((existingStop: Stop) => existingStop.previous_go_id === stop.stop_id));
		}

		const stopsCollection = await stops.getCollection();
		const deleteCount = await stopsCollection.deleteMany({ latitude: { $gte: 40 } });
		console.log(`Deleted ${deleteCount.deletedCount} existing stops with latitude >= 40`);

		for (const [index, originalStop] of ut1StopsData.data.entries()) {
			console.log(`Processing stop ${index + 1}/${ut1StopsData.data.length}: ${originalStop.stop_name} (${originalStop.stop_id})`);
			const newStopId = await fetchData<StopId>(API_ROUTES.stops.STOPS_VALID_ID);
			console.log(`Generated new stop ID`, newStopId.data);
			const stop = StopSchema.safeParse({
				_id: newStopId.data,
				created_at: Dates.now('Europe/Lisbon').unix_timestamp,
				created_by: 'system',
				district_id: '',
				flags: [{
					agency_ids: ['51', '52', '53', '54', '55'],
					is_harmonized: false,
					short_name: originalStop.stop_name,
					stop_id: originalStop.stop_id,
				}],
				is_deleted: false,
				is_locked: false,
				latitude: Number(originalStop.stop_lat),
				legacy_id: originalStop.stop_id,
				lifecycle_status: 'active',
				longitude: Number(originalStop.stop_lon),
				municipality_id: '',
				name: originalStop.stop_name || 'unnamed',
				new_name: null,
				previous_go_id: originalStop.stop_id,
				short_name: '-----',
				tts_name: '',
				updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
				updated_by: 'system',
			});
			if (stop.success) preparedStops.push(stop.data);
			console.log(`Prepared stop ${index + 1}/${ut1StopsData.data.length}: ${stop.success ? 'success' : 'failed validation'}`);
			// Write to a JSON file for storage and debugging
			fs.writeFileSync(jsonFile, JSON.stringify(preparedStops, null, 2));
		}

		console.log(`Prepared ${preparedStops.length} stops`);

		//
		// Insert stops into DB

		await stops.insertMany(preparedStops);
		console.log(`Inserted ${preparedStops.length} stops`);

		//
	} catch (err) {
		console.error('Error importing stops:', err);
		process.exit(1);
	}
}

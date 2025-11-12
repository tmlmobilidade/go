/* * */

import goStops from '@/go-stops.json' with { type: 'json' };
import { OriginalStopType } from '@/original-stop.type.js';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop } from '@tmlmobilidade/types';

/* * */

(async function main() {
	try {
		//

		return;

		//
		// Delete existing stops

		console.log('Deleting All');
		await stops.deleteMany({});

		const allOriginalStops = goStops as unknown as OriginalStopType[];

		for (const originalStop of allOriginalStops) {
			//

			//
			// Prepare stop data

			const newStop: Stop = {
				_id: originalStop.code,
				bench_status: 'unknown',
				comments: [],
				connections: [],
				district_id: '',
				electricity_status: 'unknown',
				equipment: [],
				facilities: [],
				file_ids: [],
				has_bench: 'unknown',
				has_mupi: 'unknown',
				has_network_map: 'unknown',
				has_schedules: 'unknown',
				has_shelter: 'unknown',
				has_stop_sign: 'unknown',
				image_ids: [],
				is_archived: false,
				is_locked: false,
				jurisdiction: 'unknown',
				last_infrastructure_check: null,
				last_infrastructure_maintenance: null,
				last_schedules_check: null,
				last_schedules_maintenance: null,
				latitude: originalStop.latitude,
				legacy_id: originalStop.code,
				lifecycle_status: 'active',
				locality_id: '',
				longitude: originalStop.longitude,
				municipality_id: '',
				name: originalStop.name,
				new_name: originalStop.name_new ?? '',
				observations: '',
				parish_id: '',
				pole_status: 'unknown',
				road_type: 'unknown',
				shelter_code: originalStop.shelter_code ?? null,
				shelter_frame_size: undefined,
				shelter_installation_date: null,
				shelter_maintainer: null,
				shelter_make: null,
				shelter_model: null,
				shelter_status: 'unknown',
				short_name: originalStop.short_name,
				tts_name: originalStop.tts_name,
			};

			//
			// Insert stop into DB

			await stops.insertOne(newStop);
			console.log('Inserted:', newStop._id);

			//
		}

		//
	}
	catch (err) {
		console.error('Error importing stops:', err);
		process.exit(1);
	}
})();

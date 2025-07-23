// import { stops } from '@tmlmobilidade/interfaces';
// import { connectionsSchema, CreateStopSchema, equipmentSchema, facilitiesSchema, hasAnySchema, jurisdictionSchema, operationalStatusSchema, Stop } from '@tmlmobilidade/types';
// import { promises as fs } from 'fs';
// import path from 'path';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// interface StopCSV {
// 	airport: string
// 	areas: string
// 	bike_parking: string
// 	bike_sharing: string
// 	boat: string
// 	car_parking: string
// 	district_id: string
// 	district_name: string
// 	flag_maintainer: string
// 	has_abusive_parking: string
// 	has_bench: string
// 	has_cover: string
// 	has_crossing: string
// 	has_electricity: string
// 	has_flag: string
// 	has_flat_access: string
// 	has_lighting: string
// 	has_mupi: string
// 	has_network_map: string
// 	has_pip_audio: string
// 	has_pip_realtime: string
// 	has_pip_static: string
// 	has_pole: string
// 	has_schedules: string
// 	has_shelter: string
// 	has_sidewalk: string
// 	has_tactile_access: string
// 	has_tactile_schedules: string
// 	has_trash_bin: string
// 	has_wide_access: string
// 	jurisdiction: string
// 	last_accessibility_check: string
// 	last_accessibility_maintenance: string
// 	last_flag_check: string
// 	last_flag_maintenance: string
// 	last_infrastructure_check: string
// 	last_infrastructure_maintenance: string
// 	last_schedules_check: string
// 	last_schedules_maintenance: string
// 	light_rail: string
// 	locality: string
// 	location_type: string
// 	municipality_id: string
// 	municipality_name: string
// 	near_beach: string
// 	near_fire_station: string
// 	near_health_clinic: string
// 	near_historic_building: string
// 	near_hospital: string
// 	near_police_station: string
// 	near_school: string
// 	near_shopping: string
// 	near_transit_office: string
// 	near_university: string
// 	operational_status: string
// 	parent_station: string
// 	parish_id: string
// 	parish_name: string
// 	pip_audio_code: string
// 	pip_realtime_code: string
// 	platform_code: string
// 	region_id: string
// 	region_name: string
// 	shelter_code: string
// 	shelter_maintainer: string
// 	stop_code: string
// 	stop_id: string
// 	stop_lat: string
// 	stop_lon: string
// 	stop_name: string
// 	stop_name_new: string
// 	stop_short_name: string
// 	stop_url: string
// 	subway: string
// 	train: string
// 	tts_stop_name: string
// 	wheelchair_boarding: string
// }

// // Utility: Parse CSV with support for quoted values
// function parseCSV(content: string): StopCSV[] {
// 	const lines = content.trim().split('\n');
// 	const headers = lines[0].split(',').map(h => h.trim());

// 	return lines.slice(1).map((line) => {
// 		const values = line.split(',').map(v => v.trim());
// 		const row = {};
// 		headers.forEach((header, idx) => {
// 			row[header] = values[idx] ?? '';
// 		});
// 		return row as StopCSV;
// 	});
// }

// // Converts CSV row to Stop object
// function parseStopCSV(data: StopCSV): Stop {
// 	return {
// 		_id: data.stop_code,
// 		bench_status: 'unknown',
// 		comments: [],
// 		connections: connectionsSchema.Enum[data.location_type] ?? [],
// 		district_id: data.district_id,
// 		electricity_status: 'unknown',
// 		equipment: equipmentSchema.Enum[data.has_pole] ?? [],
// 		facilities: facilitiesSchema.Enum[data.has_cover] ?? [],
// 		file_ids: [],
// 		has_bench: hasAnySchema.Enum[data.has_bench] ?? 'unknown',
// 		has_mupi: hasAnySchema.Enum[data.has_mupi] ?? 'unknown',
// 		has_network_map: hasAnySchema.Enum[data.has_network_map] ?? 'unknown',
// 		has_schedules: hasAnySchema.Enum[data.has_schedules] ?? 'unknown',
// 		has_shelter: hasAnySchema.Enum[data.has_shelter] ?? 'unknown',
// 		has_stop_sign: 'unknown',
// 		image_ids: [],
// 		is_archived: undefined,
// 		is_locked: undefined,
// 		jurisdiction: jurisdictionSchema.Enum[data.jurisdiction] ?? 'unknown',
// 		last_infrastructure_check: undefined,
// 		last_infrastructure_maintenance: undefined,
// 		last_schedules_check: undefined,
// 		last_schedules_maintenance: undefined,
// 		latitude: Number(data.stop_lat),
// 		legacy_id: data.stop_code,
// 		locality_id: data.locality,
// 		longitude: Number(data.stop_lon),
// 		municipality_id: data.municipality_id,
// 		name: data.stop_name,
// 		new_name: data.stop_name_new,
// 		operational_status: operationalStatusSchema.Enum[data.operational_status] ?? 'voided',
// 		parish_id: data.parish_id,
// 		pole_status: 'unknown',
// 		road_type: 'unknown',
// 		shelter_code: data.shelter_code,
// 		shelter_frame_size: undefined,
// 		shelter_installation_date: undefined,
// 		shelter_maintainer: data.shelter_maintainer,
// 		shelter_make: undefined,
// 		shelter_model: undefined,
// 		shelter_status: 'unknown',
// 		short_name: data.stop_short_name,
// 		tts_name: data.tts_stop_name,
// 	};
// }

// async function main() {
// 	try {
// 		stops.deleteMany({}); // Clear existing stops

// 		const filePath = path.join(__dirname, 'stops.csv');
// 		const csvContent = await fs.readFile(filePath, 'utf8');
// 		const stopRows = parseCSV(csvContent);

// 		stopRows.map((row) => {
// 			try {
// 				const parsed = parseStopCSV(row);
// 				stops.insertOne(parsed);
// 			}
// 			catch (e) {
// 				console.warn('Failed to parse row:', row, e);
// 				return null;
// 			}
// 		});
// 	}
// 	catch (err) {
// 		console.error('Error processing stops CSV:', err);
// 	}
// }

// main();

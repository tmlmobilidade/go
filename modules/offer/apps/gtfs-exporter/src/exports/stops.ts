/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsV29ExportConfig } from '@/types.js';
import { GtfsBinary, GtfsTMLStop, Municipality, Stop } from '@tmlmobilidade/types';

/* * */

/**
 * Parses stop data into GTFS stops.txt format
 * @param stopData - The stop data
 * @param municipalityData - The municipality data
 * @returns The formatted stop row
 */
export function parseStop(
	stopData: Stop,
	municipalityData: Municipality,
): GtfsTMLStop {
	try {
		return {
			stop_id: stopData._id,
			stop_code: stopData.legacy_id,
			stop_name: stopData.name,
			stop_short_name: stopData.short_name,
			stop_desc: '',
			stop_lat: Number(stopData.latitude.toFixed(6)),
			stop_lon: Number(stopData.longitude.toFixed(6)),
			zone_id: '',
			stop_url: '',
			location_type: null,
			parent_station: '',
			stop_timezone: '',
			wheelchair_boarding: null,
			level_id: '',
			platform_code: '',
			stop_id_stepp: '0',
			municipality: municipalityData.name || '',
			region: municipalityData.district_id || '',
			real_time_information: '',
			schedule: '',
			network_map: '',
			observations: '',
			stop_remarks: '',
			tariff: '',
			signalling: '',
			shelter: '',
			bench: '',
			entrance_restriction: '',
			exit_restriction: '',
			equipment: '',
			preservation_state: '',
			slot: '',
			zone_shift: '',
			has_bench: (stopData.has_bench === 'available' ? 1 : 0) as GtfsBinary,
			has_shelter: (stopData.has_shelter === 'available' ? 1 : 0) as GtfsBinary,
			has_network_map: (stopData.has_network_map === 'available' ? 1 : 0) as GtfsBinary,
			has_pip_real_time: (stopData.has_mupi === 'available' ? 1 : 0) as GtfsBinary, // Check if this is correct
			has_schedules: (stopData.has_schedules === 'available' ? 1 : 0) as GtfsBinary,
			has_stop_sign: (stopData.has_stop_sign === 'available' ? 1 : 0) as GtfsBinary,
			// has_tariffs_information: (stopData.has_tariffs_information === 'available' ? 1 : 0) as GtfsBinary, Missing
			// public_visible: (stopData.public_visible === 'available' ? 1 : 0) as GtfsBinary, Missing
		};
	}
	catch (error) {
		throw new Error(`Error parsing stop ${stopData._id}: ${error}`);
	}
}

/**
 * Exports a single stop to stops.txt
 * @param stopData - The stop data
 * @param municipalityData - The municipality data
 * @param exportConfig - The export configuration
 */
export async function exportStop(
	stopData: Stop,
	municipalityData: Municipality,
	exportConfig: GtfsV29ExportConfig,
) {
	const parsedStop = parseStop(stopData, municipalityData);
	await exportConfig.writers.stops.write(parsedStop);
}

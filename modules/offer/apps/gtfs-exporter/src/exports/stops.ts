/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsV29ExportConfig } from '@/types.js';
import { type GtfsStrictV29Stops } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Municipality, type Stop } from '@tmlmobilidade/types';

import { getAgencyStopId } from '../utils/get-agency-stop-id.js';

interface ExportsStopTemporaryWorkaround {
	bench: ''
	entrance_restriction: ''
	equipment: ''
	exit_restriction: ''
	has_bench: 0 | 1
	has_network_map: 0 | 1
	has_pip_real_time: 0 | 1
	has_schedules: 0 | 1
	has_shelter: 0 | 1
	has_stop_sign: 0 | 1
	has_tariffs_information: 0 | 1
	level_id: string
	location_type: '0' | number
	municipality: string
	network_map: ''
	observations: ''
	parent_station: string
	platform_code: string
	preservation_state: ''
	public_visible: 0
	real_time_information: ''
	region: string
	schedule: ''
	shelter: ''
	signalling: ''
	slot: ''
	stop_code: string
	stop_desc: string
	stop_id: string
	stop_id_stepp: '0'
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_remarks: ''
	stop_short_name: string
	stop_timezone: string
	stop_url: string
	tariff: ''
	wheelchair_boarding: '0'
	zone_id: string
	zone_shift: ''
}

/**
 * Parses stop data into GTFS stops.txt format
 * @param stopData - The stop data
 * @param municipalityData - The municipality data
 * @param agencyId - The agency id for which to extract stop_id
 * @returns The formatted stop row
 */
export function parseStop(
	stopData: Stop,
	municipalityData: Municipality,
	agencyId: string,
): ExportsStopTemporaryWorkaround {
	try {
		const availabilityToBinary = (value?: string): 0 | 1 => (value === 'available' ? 1 : 0);

		return {
			stop_id: getAgencyStopId(stopData, agencyId),
			stop_code: getAgencyStopId(stopData, agencyId),
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
			municipality: municipalityData?._id || '',
			region: municipalityData?.district_id || '',
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
			has_bench: availabilityToBinary(stopData?.has_bench),
			has_shelter: availabilityToBinary(stopData?.has_shelter),
			has_network_map: availabilityToBinary(stopData?.has_network_map),
			has_pip_real_time: availabilityToBinary(stopData?.has_mupi), // Check if this is correct
			has_schedules: availabilityToBinary(stopData?.has_schedules),
			has_stop_sign: availabilityToBinary(stopData?.has_stop_sign),
			has_tariffs_information: 0,
			public_visible: 0,
		};
	} catch (error) {
		throw new Error(`Error parsing stop ${stopData._id}: ${error}`, error);
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
	// Use the first agency_id in exportConfig.agency_ids for this export
	const agencyId = exportConfig.agency_ids[0];
	const parsedStop = parseStop(stopData, municipalityData, agencyId);
	await exportConfig.writers.stops.write(parsedStop as GtfsStrictV29Stops);
}

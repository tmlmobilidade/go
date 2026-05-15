import { type Permission, PermissionCatalog, type Stop, type StopExportData } from '@tmlmobilidade/types';

export type StopExportCsvData = Omit<StopExportData, 'flags'>;

/**
 * Checks if a stop can be exported based on the stop flag agency constraints.
 * Flags are only used for authorization and are intentionally not exported in CSV rows.
 */
export function canExportStopFromFlags(stop: Stop, permissions: Permission[]): boolean {
	if (!stop.flags.length) return true;

	const stopAgencyIds = stop.flags.flatMap(flag => flag.agency_ids);
	if (!stopAgencyIds.length) return true;

	return PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.export,
		permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: stopAgencyIds,
	});
}

export function parseStops(row: { _id?: null | number, stop: Stop }): StopExportCsvData {
	const { _id, stop } = row;

	return {
		_id: _id ?? stop._id,
		bench_status: stop.bench_status,
		connections: stop.connections,
		district_id: stop.district_id,
		electricity_status: stop.electricity_status,
		equipment: stop.equipment,
		facilities: stop.facilities,
		has_bench: stop.has_bench,
		has_mupi: stop.has_mupi,
		has_network_map: stop.has_network_map,
		has_schedules: stop.has_schedules,
		has_shelter: stop.has_shelter,
		has_stop_sign: stop.has_stop_sign,
		jurisdiction: stop.jurisdiction,
		last_infrastructure_check: stop.last_infrastructure_check,
		last_infrastructure_maintenance: stop.last_infrastructure_maintenance,
		last_schedules_check: stop.last_schedules_check,
		last_schedules_maintenance: stop.last_schedules_maintenance,
		latitude: stop.latitude,
		legacy_id: stop.legacy_id,
		legacy_ids: stop.legacy_ids,
		lifecycle_status: stop.lifecycle_status,
		locality_id: stop.locality_id,
		longitude: stop.longitude,
		municipality_id: stop.municipality_id,
		name: stop.name,
		new_name: stop.new_name,
		parish_id: stop.parish_id,
		pole_status: stop.pole_status,
		previous_go_id: stop.previous_go_id,
		road_type: stop.road_type,
		shelter_code: stop.shelter_code,
		shelter_frame_size: stop.shelter_frame_size,
		shelter_installation_date: stop.shelter_installation_date,
		shelter_maintainer: stop.shelter_maintainer,
		shelter_make: stop.shelter_make,
		shelter_model: stop.shelter_model,
		shelter_status: stop.shelter_status,
		short_name: stop.short_name,
		tts_name: stop.tts_name,
	};
}

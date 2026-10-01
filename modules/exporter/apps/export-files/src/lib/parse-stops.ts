import { type StopExportData } from '@tmlmobilidade/go-types-downloads';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

export type StopExportCsvData = Omit<StopExportData, 'flags'> & {
	municipality_name: null | string
};

/**
 * The ordered fields of the stop export CSV data.
 * The order is important because it determines the order of the fields in the CSV file.
 */
export const STOP_EXPORT_ORDERED_FIELDS = [
	// GENERAL
	'_id',
	'jurisdiction',
	'legacy_id',
	'legacy_ids',
	'lifecycle_status',
	'name',
	'new_name',
	'previous_go_id',
	'short_name',
	'tts_name',
	'observations',

	// LOCATION
	'district_id',
	'latitude',
	'locality_id',
	'longitude',
	'municipality_name',
	'municipality_id',
	'parish_id',

	// SHELTER
	'shelter_code',
	'shelter_installation_date',
	'shelter_maintainer',
	'shelter_make',
	'shelter_model',
	'shelter_status',

	// FACILITIES
	'connections',
	'facilities',
] as const satisfies ReadonlyArray<keyof StopExportCsvData>;

/* * */

interface ParseStopRow {
	_id?: null | number
	municipality_name: null | string
	stop: Stop
}

function toOrderedCsvData(source: StopExportCsvData): StopExportCsvData {
	const orderedEntries = STOP_EXPORT_ORDERED_FIELDS.map(field => [field, source[field]] as const);
	return Object.fromEntries(orderedEntries) as StopExportCsvData;
}

/* * */

export function parseStops(row: ParseStopRow): StopExportCsvData {
	const { _id, municipality_name: municipalityName, stop } = row;
	const shelter = stop.shelter;

	return toOrderedCsvData({
		_id: String(_id ?? stop._id),
		connections: stop.connections,
		district_id: String(stop.location.primary.osm_id),
		facilities: stop.facilities,
		jurisdiction: stop.jurisdiction,
		latitude: stop.latitude,
		legacy_id: stop.legacy_id,
		legacy_ids: stop.legacy_ids,
		lifecycle_status: stop.lifecycle_status,
		locality_id: stop.location.neighbourhood ? String(stop.location.neighbourhood.osm_id) : null,
		longitude: stop.longitude,
		municipality_id: String(stop.location.secondary.osm_id),
		municipality_name: municipalityName ?? null,
		name: stop.name,
		new_name: stop.new_name,
		observations: stop.observations,
		parish_id: String(stop.location.tertiary.osm_id),
		previous_go_id: stop.previous_go_id,
		shelter_code: shelter?.code ?? null,
		shelter_installation_date: shelter?.installation_date ?? null,
		shelter_maintainer: shelter?.maintainer ?? null,
		shelter_make: shelter?.make ?? null,
		shelter_model: shelter?.model ?? null,
		shelter_status: shelter?.status ?? 'unknown',
		short_name: stop.short_name,
		tts_name: stop.tts_name,
	});
}

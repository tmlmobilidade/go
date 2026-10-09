/* eslint-disable perfectionist/sort-objects */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

import { type InfrastructureStopsV1OutputRow } from './types.js';

/* * */

/**
 * Parses a stop into a flat row in the existing stop export CSV column order.
 * @param stop The stop to export.
 * @returns The output row, with lists represented as comma-separated values.
 */
export function parseStopsExtraction(stop: Stop): InfrastructureStopsV1OutputRow {
	return {
		// General
		_id: stop._id,
		jurisdiction: stop.jurisdiction,
		legacy_id: stop.legacy_id,
		legacy_ids: stop.legacy_ids.join(','),
		lifecycle_status: stop.lifecycle_status,
		name: stop.name,
		new_name: stop.new_name,
		previous_go_id: stop.previous_go_id,
		short_name: stop.short_name,
		tts_name: stop.tts_name,
		observations: stop.observations,

		// Location
		district_id: String(stop.location.primary.osm_id),
		latitude: stop.latitude,
		locality_id: stop.location.neighbourhood ? String(stop.location.neighbourhood.osm_id) : null,
		longitude: stop.longitude,
		municipality_name: stop.location.secondary.name,
		municipality_id: String(stop.location.secondary.osm_id),
		parish_id: String(stop.location.tertiary.osm_id),

		// Shelter
		shelter_code: stop.shelter?.code ?? null,
		shelter_installation_date: stop.shelter?.installation_date ?? null,
		shelter_maintainer: stop.shelter?.maintainer ?? null,
		shelter_make: stop.shelter?.make ?? null,
		shelter_model: stop.shelter?.model ?? null,
		shelter_status: stop.shelter?.status ?? 'unknown',

		// Facilities
		connections: stop.connections.join(','),
		facilities: stop.facilities.join(','),
	};
}

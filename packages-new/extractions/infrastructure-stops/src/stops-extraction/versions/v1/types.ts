/* eslint-disable perfectionist/sort-interfaces */

import { type Stop, type StopShelter } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export interface InfrastructureStopsV1OutputRow {
	// General
	_id: Stop['_id']
	jurisdiction: Stop['jurisdiction']
	legacy_id: Stop['legacy_id']
	legacy_ids: string
	lifecycle_status: Stop['lifecycle_status']
	name: Stop['name']
	new_name: Stop['new_name']
	previous_go_id: Stop['previous_go_id']
	short_name: Stop['short_name']
	tts_name: Stop['tts_name']
	observations: Stop['observations']

	// Location
	district_id: string
	latitude: Stop['latitude']
	locality_id: null | string
	longitude: Stop['longitude']
	municipality_name: string
	municipality_id: string
	parish_id: string

	// Shelter
	shelter_code: StopShelter['code']
	shelter_installation_date: StopShelter['installation_date']
	shelter_maintainer: StopShelter['maintainer']
	shelter_make: StopShelter['make']
	shelter_model: StopShelter['model']
	shelter_status: StopShelter['status']

	// Facilities
	connections: string
	facilities: string
}

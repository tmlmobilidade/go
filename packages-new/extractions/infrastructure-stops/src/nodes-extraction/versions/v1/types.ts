/* eslint-disable perfectionist/sort-interfaces */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export interface InfrastructureNodesV1OutputRow {
	/** Public agency code used as agency_id in GTFS. */
	operator_id: string
	operator_stop_id: string
	stop_name: string
	lat: number
	lon: number
	quay_id: string
	stop_place_id: string
	mode: '' | 'AIR' | 'BUS' | 'CABLEWAY' | 'COACH' | 'FERRY' | 'FUNICULAR' | 'METRO' | 'RAIL' | 'TAXI' | 'TRAM' | 'TROLLEYBUS'
	valid_from: string
	valid_to: string
}

export type InfrastructureNodesV1Input = Pick<InfrastructureNodesV1OutputRow, 'valid_from'> & {
	namespace: string
	parent_station_id?: string
	stop: Pick<Stop, '_id' | 'flags' | 'latitude' | 'longitude' | 'name'>
	valid_to?: string
};

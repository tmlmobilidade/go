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
	mode: 'AIR' | 'BUS' | 'CABLEWAY' | 'COACH' | 'FERRY' | 'FUNICULAR' | 'METRO' | 'RAIL' | 'TAXI' | 'TRAM' | 'TROLLEYBUS'
	/** Start of the association's validity, in YYYY-MM-DD format. */
	valid_from: string
	/** End of the association's validity, in YYYY-MM-DD format, or empty when active. */
	valid_to: string
}

export type InfrastructureNodesV1Input = Omit<InfrastructureNodesV1OutputRow, 'lat' | 'lon' | 'operator_id' | 'operator_stop_id' | 'quay_id' | 'stop_name' | 'valid_to'> & {
	stop: Pick<Stop, '_id' | 'flags' | 'latitude' | 'longitude' | 'name'>
	valid_to?: string
};

/* eslint-disable perfectionist/sort-interfaces */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type TransportType } from '@tmlmobilidade/go-types-offer';

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
	mode: TransportType
	valid_from: string
	valid_to: string
}

export type InfrastructureNodesV1Input = Omit<InfrastructureNodesV1OutputRow, 'lat' | 'lon' | 'operator_id' | 'operator_stop_id' | 'quay_id' | 'stop_name' | 'valid_to'> & {
	stop: Pick<Stop, '_id' | 'flags' | 'latitude' | 'longitude' | 'name'>
	valid_to?: string
};

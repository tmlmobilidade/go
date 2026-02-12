/* * */

import { type Alert as ServiceAlert } from 'gtfs-types';

/* * */

export interface ServiceAlertExtended extends Omit<ServiceAlert, 'cause' | 'effect'> {
	cause: string
	coordinates?: [number, number]
	effect: string
	file_id?: string
	image?: {
		localized_image: {
			language?: string
			media_type: string
			url: string
		}[]
	}
}

export interface ServiceAlertResponseItem {
	alert: ServiceAlertExtended
	id: string
}

export interface ServiceAlertResponse {
	entity: ServiceAlertResponseItem[]
	header: {
		gtfs_realtime_version: string
		incrementality: string
		timestamp: number
	}
}

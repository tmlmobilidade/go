/* * */

export interface HubGtfsRtStopTimeEvent {
	delay?: null | number
	time?: null | number
}

export interface HubGtfsRtStopTimeUpdate {
	arrival?: HubGtfsRtStopTimeEvent | null
	schedule_relationship?: null | string
	stop_id?: null | string
	stop_sequence?: null | number
}

export interface HubGtfsRtTripDescriptor {
	schedule_relationship?: null | string
	trip_id?: null | string
}

export interface HubGtfsRtTripUpdate {
	stop_time_update?: HubGtfsRtStopTimeUpdate[] | null
	timestamp?: null | number
	trip?: HubGtfsRtTripDescriptor | null
	vehicle?: null | { id?: null | string }
}

export interface HubGtfsRtFeedEntity {
	id?: null | string
	stop_time_update?: HubGtfsRtStopTimeUpdate[] | null
	timestamp?: null | number
	trip?: HubGtfsRtTripDescriptor | null
	trip_update?: HubGtfsRtTripUpdate | null
	vehicle?: null | { id?: null | string }
}

export interface HubGtfsRtFeedHeader {
	gtfs_realtime_version?: string
	incrementality?: string
	timestamp?: number
}

export interface HubGtfsRtFeedMessage {
	entity: HubGtfsRtFeedEntity[]
	header: HubGtfsRtFeedHeader
}

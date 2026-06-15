/* * */

import type { Dates, TimeSlot } from '@tmlmobilidade/dates';

/* * */

export interface AppConfig {
	agencyIds: string[]
	database: string
	development: {
		isDevelopment: boolean
		lineIds: number[]
		timeEnd: Dates
		timeStart: Dates
	}
	historicalDataDaysBack: number
	historicalTransformationChunkDays: number
	historicalVehicleEventsChunkDays: number
	pipelineSteps: {
		insertCurrentWindowRides: boolean
		insertCurrentWindowWaypoints: boolean
		insertHistoricalRidesByDay: boolean
		insertHistoricalShapeNodes: boolean
		insertHistoricalVehicleEvents: boolean
		runDdl: boolean
		runTransformationAndAggregationQueries: boolean
		truncatePipelineTables: boolean
	}
	shapeNodeChunkLength: number
	syncInterval: TimeSlot
}

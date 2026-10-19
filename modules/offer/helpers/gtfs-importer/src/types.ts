/* * */

import { IsoWeekday, Month } from '@tmlmobilidade/go-types-offer';

export interface ImportOptions {
	gtfsPath: string
}

export interface ImportSummary {
	linesCreated: number
	linesInGtfs: number
	patternsCreated: number
	patternsInGtfs: number
	routesCreated: number
	routesInGtfs: number
}

export interface CalendarRule {
	description?: string
	event_id?: string
	isExclude?: boolean
	months?: Month[]
	weekdays?: IsoWeekday[]
	year_period_ids?: string[]
}

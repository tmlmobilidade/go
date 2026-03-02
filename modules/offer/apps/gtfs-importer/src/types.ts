/* * */

import { IsoWeekday } from '@tmlmobilidade/types';

export interface ImportOptions {
	agencyIds?: string[]
	dryRun?: boolean
	gtfsPath: string
}

export interface ImportSummary {
	linesCreated: number
	linesUpdated: number
	patternsCreated: number
	patternsUpdated: number
	routesCreated: number
	routesUpdated: number
}

export interface CalendarRule {
	description?: string
	weekdays: IsoWeekday[]
	yearPeriodIds: string[]
}

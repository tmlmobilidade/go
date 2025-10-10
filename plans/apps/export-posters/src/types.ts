/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export interface ExportToHitouchConfig {
	day_types: Record<string, OperationalDate[]>
	output: string
	workdir: string
}

/* * */

export interface CalendarAssignmentsExt {
	day_type_id: string
	service_id: string
}

export interface CalendarExt {
	comment: string
	index: string
	service_id: string
}

export interface DayTypesExt {
	day_type_id: string
	friday: boolean
	monday: boolean
	name: string
	saturday: boolean
	sequence_number: number
	sunday: boolean
	thursday: boolean
	tuesday: boolean
	wednesday: boolean
}

/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export interface ExportToHitouchConfig {
	date_range: {
		end: OperationalDate
		start: OperationalDate
	}
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

export interface DayTypeConfig {
	_id: string
	dates: OperationalDate[]
	day_type: '1' | '2' | '3'
	index: number
	name: string
	period: '1' | '2' | '3'

}

export interface GTFS_Date {
	date: OperationalDate
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes?: string
	period: '1' | '2' | '3'
}

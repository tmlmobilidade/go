/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

export interface PDFStatus {
	[key: string]: unknown
	downloadLink?: string
	status: string
}

export interface TokenResponse {
	access_token: string
	expires_in: number
}

export interface GtfsDate {
	date: OperationalDateInt
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes?: string
}

export interface GtfsCalendar {
	dates: Map<OperationalDateInt, GtfsDate>
	plan_id: string
}

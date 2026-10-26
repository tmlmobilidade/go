/* * */

import { type OutputRow, type SteppWriters } from './utils/writers.js';

/* * */

export type Row = Record<string, string | undefined>;

export interface Trip {
	first?: { sequence: number, stopId: string }
	last?: { sequence: number, stopId: string }
	row: Row
}

export interface SharedRow {
	activeFrom: number
	createdAt: number
	dates?: Set<string>
	endDate: string
	planId: string
	row: OutputRow
	startDate: string
}

export interface PlanExportConfig {
	agencyCode: string
	endDate: string
	planActiveFrom: number
	planCreatedAt: number
	planId: string
	sharedRows: Map<string, SharedRow>
	sourceDirectory: string
	startDate: string
	writers: SteppWriters
}

export interface Pattern {
	circular: boolean
	firstStop: string
	lastStop: string
	routeId: string
}

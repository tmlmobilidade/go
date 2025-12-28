/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export const exportTypeLabels = {
	'rides-raw': '2.0. Rides em bruto (SLAs)',
	'validations-by-line': '1.5. Validações por Line ID',
	'validations-by-pattern': '1.4. Validações por Pattern ID',
	'validations-by-stop': '1.3. Validações por Stop ID',
	'validations-by-stop-by-pattern': '1.2. Validações por Stop ID, por Pattern ID',
	'validations-by-stop-by-trip': '1.1. Validações por Stop ID, por Trip ID',
	'validations-raw': '1.0. Validações em bruto',
	'vehicle-events-raw': '3.0. Vehicle Events em bruto',
} as const;

export type ExportType = keyof typeof exportTypeLabels;

/* * */

export interface ExportContext {
	_id: string
	dates: {
		end: OperationalDate
		start: OperationalDate
	}
	filters: {
		agency_ids: string[]
		line_ids: string[]
		pattern_ids: string[]
		stop_ids: string[]
		vehicle_ids: number[]
	}
	output: string
}

/* * */

export interface TaskProps {
	context: ExportContext
	message: (msg: string) => void
}

/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

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

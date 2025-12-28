/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export interface FilterValues {
	dates: { end: OperationalDate, start: OperationalDate }
	line_ids: string[]
	pattern_ids: string[]
	stop_ids: string[]
}

/* * */

export interface TaskProps {
	filter_values: FilterValues
	message: (msg: string) => void
}

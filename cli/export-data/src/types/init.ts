/* * */

export interface FilterValues {
	line_ids: string[]
	pattern_ids: string[]
	stop_ids: string[]
}

/* * */

export interface TaskProps {
	filter_values: FilterValues
	message: (msg: string) => void
}

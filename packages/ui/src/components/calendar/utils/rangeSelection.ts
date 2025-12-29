import { Dates } from '@tmlmobilidade/dates';

import { DateRangeState } from '../contexts/CalendarUI.context';

/* * */

export interface DayRangeStatus {
	isEnd: boolean
	isInRange: boolean
	isStart: boolean
}

/* * */

/**
 * Determines the range status for a given day
 * This derives all visual state from the range selection state
 * Hover state is now handled via DOM manipulation for performance
 */
export function getDayRangeStatus(
	day: Dates,
	range: DateRangeState,
): DayRangeStatus {
	const { end, start } = range;

	// Early return if no selection
	if (!start) {
		return {
			isEnd: false,
			isInRange: false,
			isStart: false,
		};
	}

	const dayOp = day.operational_date;
	const startOp = start.operational_date;
	const endOp = end?.operational_date;

	// Check if this is the start or end day
	const isStart = dayOp === startOp;
	const isEnd = endOp ? dayOp === endOp : false;

	// Determine if day is in the confirmed range
	let isInRange = false;
	if (start && end) {
		// Use min/max to handle reversed selections
		const minOp = startOp < endOp ? startOp : endOp;
		const maxOp = startOp > endOp ? startOp : endOp;
		isInRange = dayOp > minOp && dayOp < maxOp;
	}

	return {
		isEnd,
		isInRange,
		isStart,
	};
}

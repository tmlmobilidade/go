/* * */

import type { DateRangeState } from '../contexts/CalendarUI.context';

import { type CalendarKey, parseCalendarKey } from '@tmlmobilidade/dates';
import { type Dates } from '@tmlmobilidade/dates';

/* * */

export interface DayRangeStatus {
	isEnd: boolean
	isInRange: boolean
	isStart: boolean
}

/* * */

export function getDayRangeStatus(day: Dates, range: DateRangeState): DayRangeStatus {
	const { end, start } = range;

	if (!start) {
		return { isEnd: false, isInRange: false, isStart: false };
	}

	const dayKey: CalendarKey = parseCalendarKey(day);

	const isStart = dayKey === start;
	const isEnd = end ? dayKey === end : false;

	let isInRange = false;
	if (start && end) {
		const min = start < end ? start : end;
		const max = start > end ? start : end;
		// strictly inside (not including ends), same behavior as your old code
		isInRange = dayKey > min && dayKey < max;
	}

	return { isEnd, isInRange, isStart };
}

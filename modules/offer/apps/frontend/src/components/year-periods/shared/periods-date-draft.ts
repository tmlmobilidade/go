import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { type CalendarScheduleDateRange } from '@tmlmobilidade/ui';

/* * */

export interface PeriodDatesDraft {
	added: Set<CalendarDate>
	removed: Set<CalendarDate>
	selectedRange: CalendarScheduleDateRange | null
	selectionAction: 'add' | 'remove' | null
}

type PeriodDatesDraftEvent = { initialDates: Set<CalendarDate>, previewDates: Set<CalendarDate>, range: CalendarScheduleDateRange | null, type: 'select' } | { type: 'cancel' } | { type: 'reset' };

/* * */

export function createPeriodDatesDraft(): PeriodDatesDraft {
	return { added: new Set(), removed: new Set(), selectedRange: null, selectionAction: null };
}

export function getPeriodRangeDates(range: CalendarScheduleDateRange): CalendarDate[] {
	const cursor = new Date(`${range.start}T00:00:00Z`);
	const end = new Date(`${range.end ?? range.start}T00:00:00Z`).getTime();
	const dates: CalendarDate[] = [];
	while (cursor.getTime() <= end) {
		dates.push(toCalendarDate(cursor.toISOString().slice(0, 10)));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}

export function reducePeriodDatesDraft(state: PeriodDatesDraft, event: PeriodDatesDraftEvent): PeriodDatesDraft {
	if (event.type === 'reset') return createPeriodDatesDraft();
	if (event.type === 'cancel' || !event.range) return { ...state, selectedRange: null, selectionAction: null };
	const { initialDates, previewDates, range } = event;
	const action = !range.end ? (previewDates.has(range.start) ? 'remove' : 'add') : state.selectionAction ?? (previewDates.has(range.start) ? 'remove' : 'add');
	if (!range.end) return { ...state, selectedRange: range, selectionAction: action };
	const added = new Set(state.added);
	const removed = new Set(state.removed);
	for (const date of getPeriodRangeDates(range)) {
		if (action === 'add') {
			removed.delete(date);
			if (initialDates.has(date)) added.delete(date);
			else added.add(date);
		} else {
			added.delete(date);
			if (initialDates.has(date)) removed.add(date);
			else removed.delete(date);
		}
	}
	return { added, removed, selectedRange: range, selectionAction: action };
}

import { type CalendarDate, type IsoWeekday, OperationalDateIntSchema, type TimezoneIdentified } from '@tmlmobilidade/go-types-shared';
/* * */

import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { calendarKey, Dates, DEFAULT_CAL_TZ } from '@tmlmobilidade/go-utils-dates';

/* * */

export function isHoliday(
	input: CalendarDate | Dates,
	holidays: Pick<Holiday, 'dates'>[],
	tz: TimezoneIdentified = DEFAULT_CAL_TZ,
): boolean {
	const key = input instanceof Dates ? calendarKey(input, tz) : input;
	const yyyymmdd = OperationalDateIntSchema.parse(key);

	return holidays.some(holiday => holiday.dates.includes(yyyymmdd));
}

/**
 * Scheduling weekday (1..7 Mon..Sun), treating configured holidays as Sundays.
 */
export function calendarWeekday(input: CalendarDate | Dates, holidays: null | Pick<Holiday, 'dates'>[], tz: TimezoneIdentified = DEFAULT_CAL_TZ): IsoWeekday {
	const key = input instanceof Dates ? calendarKey(input, tz) : input;

	if (holidays && isHoliday(key, holidays, tz)) {
		return 7;
	}

	const d = Dates.fromFormat(`${key} 12:00`, 'yyyy-MM-dd HH:mm', tz);
	return Number(d.toFormat('E')) as IsoWeekday;
}

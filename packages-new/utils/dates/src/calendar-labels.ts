import { type IsoWeekday, type Month } from '@tmlmobilidade/go-types-shared';
import { Info } from 'luxon';

/** Localized Gregorian month labels, January first, independent of the viewer's timezone. */
export function getMonthOptions(locale: string, format: 'long' | 'narrow' | 'short' = 'short'): { label: string, value: Month }[] {
	return Info.months(format, { locale }).map((label, index) => ({
		label,
		value: (index + 1) as Month,
	}));
}

/** ISO weekdays, Monday first. Holiday grouping belongs to each scheduling view, not this calendar model. */
export function getWeekdayOptions(locale: string, format: 'long' | 'narrow' | 'short' = 'short'): { label: string, value: IsoWeekday }[] {
	return Info.weekdays(format, { locale }).map((label, index) => ({
		label,
		value: (index + 1) as IsoWeekday,
	}));
}

import { type IsoWeekday, type Month } from '@tmlmobilidade/go-types-shared';
import { Info } from 'luxon';

/** Compact option labels use an initial capital and omit the final abbreviation dot. */
function formatShortCalendarLabel(label: string, locale: string): string {
	const value = label.replace(/\.$/u, '');
	return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}

/** Localized Gregorian month labels, January first, independent of the viewer's timezone. */
export function getMonthOptions(locale: string, format: 'long' | 'narrow' | 'short' = 'short'): { label: string, value: Month }[] {
	return Info.months(format, { locale }).map((label, index) => ({
		label,
		value: (index + 1) as Month,
	}));
}

/** ISO weekdays, Monday first. Holiday grouping belongs to each scheduling view. */
export function getWeekdayOptions(locale: string, format: 'long' | 'narrow' | 'short' = 'short'): { label: string, value: IsoWeekday }[] {
	return Info.weekdays(format, { locale }).map((label, index) => ({
		label,
		value: (index + 1) as IsoWeekday,
	}));
}

/** Base-language month abbreviations for compact UI labels, capitalized without a final dot. */
export function getCompactMonthOptions(locale: string): { label: string, value: Month }[] {
	return getMonthOptions(new Intl.Locale(locale).language).map(option => ({
		...option,
		label: formatShortCalendarLabel(option.label, locale),
	}));
}

/**
 * Compact UI weekday labels. Base-language short forms avoid regional expansion
 * such as pt-PT's full "sábado" when the UI needs "Sáb". Native labels stay available above.
 */
export function getCompactWeekdayOptions(locale: string): { label: string, value: IsoWeekday }[] {
	return getWeekdayOptions(new Intl.Locale(locale).language).map(option => ({
		...option,
		label: formatShortCalendarLabel(option.label, locale),
	}));
}

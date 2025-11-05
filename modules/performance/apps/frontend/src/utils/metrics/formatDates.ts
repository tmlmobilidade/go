import { Dates } from '@go/utils-dates';
import { useTranslations } from 'next-intl';

export interface DayInfo {
	day_group: string
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: string
}

/**
 * Base function to parse and format a date string.
 */
function parseAndFormatDate(day_group: string, t: ReturnType<typeof useTranslations>) {
	const dt = Dates.fromISO(day_group);
	const formatted = t('dates.formatted', { date: dt.js_date });
	return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Detailed version for tooltips / labels with holidays.
 */
export function formatDayDetailed(date: DayInfo, t: ReturnType<typeof useTranslations>) {
	if (!date.day_group) return '';
	const base = parseAndFormatDate(date.day_group, t);

	if (date.holiday === '1') {
		const holidayText = date.notes?.length ? date.notes : t('dates.holiday');
		return `${base} (${holidayText})`;
	}

	return base;
}

/**
 * Simple version for chart X-axis, short and clean.
 * e.g., "Seg 28/10"
 */
export function formatDayShort(date: DayInfo, t: ReturnType<typeof useTranslations>) {
	if (!date.day_group) return '';
	const dt = Dates.fromISO(date.day_group);
	return dt.js_date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', weekday: 'short' });
}

/**
 * Convert detailed date string to a short version for X-axis.
 * Examples:
 * - "Segunda-feira, 03 de novembro de 2025" -> "Seg 03/11"
 * - "Segunda-feira, 03 de novembro de 2025 (Feriado X)" -> "Seg 03/11"
 */
export function getShortLabelFromDetailed(detailed: string) {
	if (!detailed) return '';

	// Remove parentheses and content inside
	const label = detailed.replace(/\s*\(.*\)$/, '');

	// Extract day and month using regex
	const match = label.match(/(\d{2})\s+de\s+([^\s]+)/i);
	if (!match) return label;

	const day = match[1];
	const monthName = match[2].toLowerCase();

	// Map month name to numeric
	const monthMap: Record<string, string> = {
		abril: '04',
		agosto: '08',
		dezembro: '12',
		fevereiro: '02',
		janeiro: '01',
		julho: '07',
		junho: '06',
		maio: '05',
		março: '03',
		novembro: '11',
		outubro: '10',
		setembro: '09',
	};

	const month = monthMap[monthName] ?? '??';

	// Get first 3 letters of weekday
	const weekdayMatch = label.match(/^([^\s,]+)/);
	const weekday = weekdayMatch ? weekdayMatch[1].slice(0, 3) : '';

	return `${weekday} ${day}/${month}`; // e.g., "Seg 03/11"
}

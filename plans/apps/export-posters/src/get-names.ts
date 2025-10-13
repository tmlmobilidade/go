/* * */

import { OperationalDate } from '@tmlmobilidade/types';

/**
 * Get weekday names in Portuguese from weekday indexes.
 * @param weekdayIndexes Array of weekday indexes (1=Monday, 7=Sunday)
 * @returns Array of weekday names in Portuguese.
 */
export function getWeekdayNames(weekdayIndexes: string[]): string[] {
	return weekdayIndexes.sort().map((d) => {
		switch (d) {
			case '1': return 'Segundas';
			case '2': return 'Terças';
			case '3': return 'Quartas';
			case '4': return 'Quintas';
			case '5': return 'Sextas';
			case '6': return 'Sábados';
			case '7': return 'Domingos';
			default: return '';
		}
	}).filter(Boolean);
}

/**
 * Get period names in Portuguese from period indexes.
 * @param periodIndexes Array of period indexes (1=School Period, 2=School Holidays, 3=Summer Period)
 * @returns Array of period names in Portuguese.
 */
export function getPeriodName(period: string): string {
	switch (period) {
		case '1': return 'Período Escolar';
		case '2': return 'Férias Escolares';
		case '3': return 'Período de Verão';
		default: return '';
	}
}

/**
 * Format a list of dates (YYYYMMDD) into a human-readable string in Portuguese.
 * Rules:
 * - Only consecutive on the same month: `4 a 7 Fev. 2025` (or `4 e 5 Fev. 2025` if just two days)
 * - Consecutive + non-consecutive on same month: `4 a 7 Fev. e 12, 14 e 22 Fev. 2025`
 * - Only non-consecutive: `12, 14 e 22 Fev. 2025`
 * - Separate different months with `; `
 * - Use abbreviated month names: Jan., Fev., Mar., Abr., Mai, Jun., Jul., Ago., Set., Out., Nov., Dez.
 * @param dates Array of dates in YYYYMMDD format.
 * @returns Formatted string of dates.
 */
export function getFormattedDates(dates: OperationalDate[]): string {
	// Sort and deduplicate
	const sortedDates = Array.from(new Set(dates)).sort();
	// Group by month and year
	const groupedDates: Record<string, number[]> = {};
	for (const date of sortedDates) {
		const monthYear = date.slice(0, 6); // YYYYMM
		const day = parseInt(date.slice(6, 8), 10);
		if (!groupedDates[monthYear]) groupedDates[monthYear] = [];
		groupedDates[monthYear].push(day);
	}
	// Month names in Portuguese
	const monthNames = ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'];
	// Format each group
	const formattedGroups = Object.entries(groupedDates).map(([monthYear, days]) => {
		const year = monthYear.slice(0, 4);
		const month = parseInt(monthYear.slice(4, 6), 10);

		days.sort((a, b) => a - b);

		// Identify consecutive ranges
		const ranges: number[][] = [];
		let start = days[0];
		let prev = days[0];

		for (let i = 1; i < days.length; i++) {
			if (days[i] === prev + 1) {
				prev = days[i];
			}
			else {
				ranges.push([start, prev]);
				start = days[i];
				prev = days[i];
			}
		}
		ranges.push([start, prev]);

		// Separate consecutive and non-consecutive
		const consecutive = ranges.filter(([a, b]) => b > a);
		const nonConsecutive = ranges.filter(([a, b]) => a === b).map(([a]) => a);

		let formatted = '';

		// Helper for formatting ranges correctly (handling 2-day case)
		const formatRange = ([a, b]: [number, number]) =>
			b === a + 1 ? `${a} e ${b}` : `${a} a ${b}`;

		// Case 1: Only consecutive
		if (consecutive.length > 0 && nonConsecutive.length === 0) {
			const [a, b] = consecutive[0];
			formatted = `${formatRange([a, b])} ${monthNames[month - 1]} ${year}`;
		}
		// Case 2: Only non-consecutive
		else if (consecutive.length === 0 && nonConsecutive.length > 0) {
			const list = nonConsecutive.length > 1
				? `${nonConsecutive.slice(0, -1).join(', ')} e ${nonConsecutive.at(-1)}`
				: `${nonConsecutive[0]}`;
			formatted = `${list} ${monthNames[month - 1]} ${year}`;
		}
		// Case 3: Mixed consecutive + non-consecutive
		else {
			const rangeParts = consecutive.map(formatRange).join(', ');
			const nonConsecList = nonConsecutive.length > 1
				? `${nonConsecutive.slice(0, -1).join(', ')} e ${nonConsecutive.at(-1)}`
				: `${nonConsecutive[0]}`;
			formatted = `${rangeParts} ${monthNames[month - 1]} e ${nonConsecList} ${monthNames[month - 1]} ${year}`;
		}

		return formatted;
	});

	return formattedGroups.join('; ');
}

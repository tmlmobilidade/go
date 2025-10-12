/* * */

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

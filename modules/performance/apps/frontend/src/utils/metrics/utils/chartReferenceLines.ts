/**
 * Chart Reference Lines Utilities
 * Functions for generating reference lines in charts
 */

/* * */

export interface EventReferenceLine {
	color: string
	label: string
	labelPosition: 'bottom' | 'insideBottomRight' | 'left' | 'right' | 'top'
	x: string
}

/* * */

/**
 * Generates event reference lines for daily charts based on day_detailed field
 * Extracts holiday/notes information from parentheses in day_detailed
 *
 * @param data Array of chart data that might have day_detailed field
 * @param timeView Current time view - only shows reference lines for 'daily'
 * @param color Color for reference lines (default: 'var(--color-primary)')
 * @returns Array of event reference lines
 */
export function generateEventReferenceLines(
	data: Record<string, unknown>[],
	timeView: 'annual' | 'daily' | 'monthly',
	color = 'var(--color-primary)',
): EventReferenceLine[] {
	if (timeView !== 'daily') return []; // Only show reference lines for daily data

	return data
		.filter((item) => {
			const dayDetailed = item.day_detailed;
			return typeof dayDetailed === 'string' && dayDetailed.includes('(');
		}) // contains holiday/notes
		.map((item) => {
			const dayDetailed = item.day_detailed as string;
			// Extract only what's inside parentheses
			const match = dayDetailed.match(/\(([^)]+)\)/);
			const label = match ? match[1] : dayDetailed;

			return {
				color,
				label,
				labelPosition: 'top' as const,
				x: dayDetailed,
			};
		});
}

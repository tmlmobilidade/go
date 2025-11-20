/**
 * Chart utilities for visualization
 */

/**
 * Generate colors for chart series
 */
export function generateColors(items: string[]): Record<string, string> {
	const colors: Record<string, string> = {};
	const chartColors = [
		'var(--chart-color-1)',
		'var(--chart-color-2)',
		'var(--chart-color-3)',
		'var(--chart-color-4)',
		'var(--chart-color-5)',
	];

	items.forEach((item, index) => {
		colors[item] = chartColors[index % chartColors.length];
	});

	return colors;
}

/**
 * Get the latest timestamp from metric data
 */
export function getLatestTimestamp(data: { generated_at: string }[]): Date | null {
	if (!data?.length) return null;

	return data
		.map(item => new Date(item.generated_at))
		.sort((a, b) => b.getTime() - a.getTime())[0] || null;
}

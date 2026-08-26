/* * */

export const LINE_HEATMAP_HOURS = Array.from({ length: 24 }, (_, index) => index + 4);
export const LINE_HEATMAP_DAY_IDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function formatLineHeatmapHour(hour: number) {
	return String(hour % 24).padStart(2, '0');
}

export function normalizeLineHeatmapPosition(dayIndex: number, hour: number) {
	if (hour >= 4) return { dayIndex, hour };
	return {
		dayIndex: (dayIndex + LINE_HEATMAP_DAY_IDS.length - 1) % LINE_HEATMAP_DAY_IDS.length,
		hour: hour + 24,
	};
}

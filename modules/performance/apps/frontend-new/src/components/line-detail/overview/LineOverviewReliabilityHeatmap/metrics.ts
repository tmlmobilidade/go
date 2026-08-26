/* * */

import { LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS, normalizeLineHeatmapPosition } from '@/utils/line-detail-heatmap';
import { type RidePerformanceHeatmapCell } from '@tmlmobilidade/go-types-performance';
import { type HeatmapCell, type HeatmapTone } from '@tmlmobilidade/ui';

/* * */

export type LineOverviewReliabilityHeatmapMetric = 'advances' | 'delays' | 'service' | 'validations';

export function createOperationalHeatmapCells(
	cells: RidePerformanceHeatmapCell[],
	metric: Exclude<LineOverviewReliabilityHeatmapMetric, 'validations'>,
): HeatmapCell[] {
	const field = metric === 'service' ? 'service_pct' : metric === 'delays' ? 'delays_pct' : 'advances_pct';
	return cells.flatMap((cell) => {
		const value = cell[field];
		const position = normalizeLineHeatmapPosition(cell.day_of_week - 1, cell.hour);
		const rowId = LINE_HEATMAP_DAY_IDS[position.dayIndex];
		if (value === null || rowId === undefined || !LINE_HEATMAP_HOURS.includes(position.hour)) return [];
		return [{ columnId: String(position.hour), rowId, value }];
	});
}

export function getLineHeatmapTone(metric: Exclude<LineOverviewReliabilityHeatmapMetric, 'validations'>, value: number): HeatmapTone {
	if (metric === 'service') {
		if (value < 85) return 'critical';
		if (value < 90) return 'high';
		if (value < 95) return 'medium';
		if (value < 98) return 'low';
		return 'positive';
	}

	if (metric === 'advances') {
		if (value > 4) return 'critical';
		if (value > 3) return 'high';
		if (value > 2) return 'medium';
		if (value > 1) return 'low';
		return 'positive';
	}

	if (value > 15) return 'critical';
	if (value > 10) return 'high';
	if (value > 7) return 'medium';
	if (value > 5) return 'low';
	return 'positive';
}

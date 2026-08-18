/* * */

import { type HeatmapCell, type HeatmapTone } from '@tmlmobilidade/ui';

/* * */

export type LineHeatmapMetric = 'advances' | 'delays' | 'service' | 'validations';

export const HEATMAP_HOURS = Array.from({ length: 19 }, (_, index) => index + 5);
export const HEATMAP_DAY_IDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const METRIC_HOURLY_VALUES: Record<LineHeatmapMetric, number[]> = {
	advances: [1.2, 1.6, 2.8, 3.5, 2.9, 2.1, 1.5, 1.2, 1.1, 1.3, 1.6, 2.1, 2.7, 3.1, 2.3, 1.8, 1.5, 1.2, 0.9],
	delays: [4, 6, 14, 18, 13, 8, 5, 4, 4.5, 5, 6, 7, 10, 12, 8, 6, 5, 4, 3],
	service: [98, 97, 91, 86, 90, 94, 97, 98, 98, 97, 96, 94, 91, 89, 93, 96, 98, 98, 99],
	validations: [8, 18, 74, 122, 96, 64, 48, 51, 55, 58, 63, 82, 108, 116, 92, 61, 38, 22, 11],
};

const DAY_FACTORS = [1, 1.06, 0.97, 1.02, 1.08, 0.72, 0.58];

/* * */

export function createLineHeatmapCells(metric: LineHeatmapMetric): HeatmapCell[] {
	return HEATMAP_DAY_IDS.flatMap((rowId, dayIndex) => HEATMAP_HOURS.map((hour, hourIndex) => ({
		columnId: String(hour),
		rowId,
		value: Number((METRIC_HOURLY_VALUES[metric][hourIndex] * DAY_FACTORS[dayIndex]).toFixed(1)),
	})));
}

export function getLineHeatmapTone(metric: LineHeatmapMetric, value: number): HeatmapTone {
	if (metric === 'validations') {
		if (value >= 100) return 'intensity-5';
		if (value >= 75) return 'intensity-4';
		if (value >= 50) return 'intensity-3';
		if (value >= 25) return 'intensity-2';
		return 'intensity-1';
	}

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

/* * */

import { LINE_HEATMAP_DAY_IDS, LINE_HEATMAP_HOURS, normalizeLineHeatmapPosition } from '@/utils/line-detail-heatmap';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { type HeatmapCell } from '@tmlmobilidade/ui';

/* * */

const WEEKDAY_INDEX: Record<string, number> = {
	Fri: 4,
	Mon: 0,
	Sat: 5,
	Sun: 6,
	Thu: 3,
	Tue: 1,
	Wed: 2,
};

/* * */

export function createDemandHeatmapCells(points: PassengerDemandOverTimePoint[]): HeatmapCell[] {
	const values = new Map<string, number>();
	const formatter = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		hourCycle: 'h23',
		timeZone: 'Europe/Lisbon',
		weekday: 'short',
	});

	for (const point of points) {
		const parts = Object.fromEntries(formatter.formatToParts(new Date(point.period)).map(part => [part.type, part.value]));
		const calendarDayIndex = WEEKDAY_INDEX[parts.weekday];
		if (calendarDayIndex === undefined) continue;
		const { dayIndex, hour } = normalizeLineHeatmapPosition(calendarDayIndex, Number(parts.hour));
		if (!LINE_HEATMAP_HOURS.includes(hour)) continue;
		const key = `${dayIndex}:${hour}`;
		values.set(key, (values.get(key) ?? 0) + point.passenger_demand);
	}

	return LINE_HEATMAP_DAY_IDS.flatMap((rowId, dayIndex) => LINE_HEATMAP_HOURS.map(hour => ({
		columnId: String(hour),
		rowId,
		value: values.get(`${dayIndex}:${hour}`) ?? 0,
	})));
}

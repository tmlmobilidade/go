'use client';

/* * */

import { Heatmap as MantineHeatmap, type HeatmapProps as MantineHeatmapProps } from '@mantine/charts';

/* * */

import styles from './styles.module.css';

import { data as defaultHeatMapData } from './data';

/* * */

/** Mantine maps lower values to the first color, higher to the last — order is light → dark on theme chart palette. */
const HeatmapThemeColors = [
	'var(--heatmap-stop-1)',
	'var(--heatmap-stop-2)',
	'var(--heatmap-stop-3)',
	'var(--heatmap-stop-4)',
	'var(--heatmap-stop-5)',
] as const;

function GetTooltipLabel({ date, value }: { date: string, value: null | number }) {
	if (value === null) {
		return date;
	}
	return `${date} — ${value}`;
}

/* * */
interface HeatMapProps extends Omit<MantineHeatmapProps, 'data'> {
	data?: MantineHeatmapProps['data']
}

// Full calendar year span from data so the grid starts in January (not Mantine’s default “last 12 months”).
function GetCalendarYearRangeFromData(data: Record<string, number>): { endDate: string, startDate: string } {
	const isoDates = Object.keys(data).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
	if (isoDates.length === 0) {
		const y = new Date().getUTCFullYear();
		return { endDate: `${y}-12-31`, startDate: `${y}-01-01` };
	}
	const y0 = isoDates[0].slice(0, 4);
	const y1 = isoDates[isoDates.length - 1].slice(0, 4);
	return { endDate: `${y1}-12-31`, startDate: `${y0}-01-01` };
}

export function HeatMap({ data = defaultHeatMapData, ...props }: HeatMapProps) {
	const calendarRange = GetCalendarYearRangeFromData(data);
	return (
		<div className={styles.wrapper}>
			<MantineHeatmap
				classNames={{ ...styles, ...props.classNames }}
				{...props}
				colors={props.colors ?? [...HeatmapThemeColors]}
				data={data}
				endDate={props.endDate ?? calendarRange.endDate}
				gap={5}
				getTooltipLabel={props.getTooltipLabel ?? GetTooltipLabel}
				rectRadius={5}
				rectSize={15}
				startDate={props.startDate ?? calendarRange.startDate}
				withOutsideDates={props.withOutsideDates ?? false}
				withTooltip={props.withTooltip ?? true}
				withWeekdayLabels={false}
				splitMonths
				withMonthLabels
			/>
		</div>
	);
}

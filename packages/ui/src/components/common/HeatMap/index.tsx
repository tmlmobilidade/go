'use client';

/* * */

import { Heatmap as MantineHeatmap, type HeatmapProps as MantineHeatmapProps } from '@mantine/charts';

/* * */

import styles from './styles.module.css';

import { data as defaultHeatMapData } from './data';

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
		<MantineHeatmap
			classNames={{ ...styles, ...props.classNames }}
			{...props}
			data={data}
			endDate={props.endDate ?? calendarRange.endDate}
			gap={5}
			rectRadius={5}
			rectSize={15}
			startDate={props.startDate ?? calendarRange.startDate}
			withOutsideDates={props.withOutsideDates ?? false}
			splitMonths
			withMonthLabels
		/>
	);
}

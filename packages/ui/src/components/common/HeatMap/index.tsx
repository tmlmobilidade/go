'use client';

/* * */

import { Heatmap as MantineHeatmap, type HeatmapProps as MantineHeatmapProps } from '@mantine/charts';

/* * */

import styles from './styles.module.css';

import { data as defaultHeatMapData } from './data';

interface HeatMapProps extends Omit<MantineHeatmapProps, 'data'> {
	data?: MantineHeatmapProps['data']
}

export function HeatMap({ data = defaultHeatMapData, ...props }: HeatMapProps) {
	return (
		<MantineHeatmap
			classNames={{ ...styles, ...props.classNames }}
			{...props}
			data={data}
			splitMonths
			withMonthLabels
		/>
	);
}

'use client';

/* * */

import { type AreaChartSeries, AreaChart as MantineAreaChart, type AreaChartProps as MantineAreaChartProps } from '@mantine/charts';
import clsx from 'clsx';

import styles from './styles.module.css';

/* * */

export type { AreaChartSeries };

export interface AreaChartProps extends MantineAreaChartProps {
	/** Series whose area is filled. Defaults to the first series. */
	primarySeriesName?: string
	/** Fixed vertical tooltip position relative to the chart. */
	tooltipOffsetY?: number
	/** Shows only the active point instead of rendering every point. */
	withHoverDotsOnly?: boolean
	/** Shows a dashed reference line and crosshair pointer while inspecting the chart. */
	withReferenceCursor?: boolean
}

/* * */

export function AreaChart({
	activeDotProps,
	areaProps,
	className,
	dotProps,
	fillOpacity = 0.18,
	primarySeriesName,
	series,
	tooltipOffsetY = -40,
	tooltipProps,
	w = '100%',
	withGradient = true,
	withHoverDotsOnly = true,
	withReferenceCursor = true,
	...props
}: AreaChartProps) {
	//

	const resolvedPrimarySeriesName = primarySeriesName ?? series[0]?.name;
	const resolveAreaProps: MantineAreaChartProps['areaProps'] = (item) => {
		const resolvedAreaProps = typeof areaProps === 'function' ? areaProps(item) : areaProps;

		return {
			fillOpacity: item.name === resolvedPrimarySeriesName ? 1 : 0,
			...resolvedAreaProps,
		};
	};

	return (
		<MantineAreaChart
			activeDotProps={{ r: 4, strokeWidth: 2, ...activeDotProps }}
			areaProps={resolveAreaProps}
			dotProps={withHoverDotsOnly ? { fillOpacity: 0, r: 0, strokeWidth: 0, ...dotProps } : dotProps}
			fillOpacity={fillOpacity}
			series={series}
			w={w}
			withGradient={withGradient}
			className={clsx(
				styles.root,
				withHoverDotsOnly && styles.hoverDotsOnly,
				withReferenceCursor && styles.referenceCursor,
				className,
			)}
			tooltipProps={{
				allowEscapeViewBox: { x: false, y: true },
				position: { y: tooltipOffsetY },
				...tooltipProps,
				cursor: tooltipProps?.cursor ?? (withReferenceCursor ? {
					fill: 'transparent',
					stroke: 'var(--color-system-text-300)',
					strokeDasharray: '3 4',
					strokeWidth: 1,
				} : false),
			}}
			{...props}
		/>
	);

	//
}

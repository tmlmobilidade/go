'use client';

/* * */

import { type DepartureDelayTrendPoint } from '@tmlmobilidade/go-types-public-info';
import { CompositeChart } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	points: DepartureDelayTrendPoint[]
	targetPercentage: number
}

interface ChartPoint {
	delay5To10: number
	delay10To20: number
	delayedPercentage: null | number
	delayMoreThan20: number
	reference: number
	time: string
}

/* * */

export function DelayTrend({ points, targetPercentage }: Props) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const timeFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
		timeZone: 'Europe/Lisbon',
	}), [i18n.language]);

	//
	// C. Transform data

	const chartData = useMemo<ChartPoint[]>(() => points.map(point => ({
		delay10To20: point.delay_10_to_20_minutes_rides_qty,
		delay5To10: point.delay_5_to_10_minutes_rides_qty,
		delayedPercentage: point.delayed_more_than_five_minutes_pct,
		delayMoreThan20: point.delay_more_than_20_minutes_rides_qty,
		reference: targetPercentage,
		time: timeFormatter.format(new Date(point.interval_start)),
	})), [points, targetPercentage, timeFormatter]);
	const maximumDelayedRides = Math.max(1, ...points.map(point => (
		point.delay_5_to_10_minutes_rides_qty
		+ point.delay_10_to_20_minutes_rides_qty
		+ point.delay_more_than_20_minutes_rides_qty
	)));
	const maximumPercentage = Math.max(
		targetPercentage,
		...points.map(point => point.delayed_more_than_five_minutes_pct ?? 0),
	);
	const percentageDomainMaximum = Math.min(100, Math.max(15, Math.ceil(maximumPercentage * 1.25)));

	//
	// F. Render components

	if (chartData.length < 2) return null;

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<p>{t('default:videowall.delay_chart.trend_title')}</p>
				<div className={styles.legend}>
					<span className={styles.delay5To10Legend}>
						{t('default:videowall.delay_chart.delay_5_to_10_series')}
					</span>
					<span className={styles.mediumDelayLegend}>
						{t('default:videowall.delay_chart.delay_10_to_20_series')}
					</span>
					<span className={styles.severeDelayLegend}>
						{t('default:videowall.delay_chart.delay_more_than_20_series')}
					</span>
					<span className={styles.delayedPercentageLegend}>
						{t('default:videowall.delay_chart.delayed_percentage_series')}
					</span>
					<span className={styles.referenceLegend}>
						{t('default:videowall.delay_chart.reference_series', '', { value: targetPercentage })}
					</span>
				</div>
			</div>

			<CompositeChart
				curveType="monotone"
				data={chartData}
				dataKey="time"
				gridAxis="y"
				h="100%"
				maxBarWidth={42}
				withDots={true}
				withTooltip={false}
				barProps={series => ({
					radius: series.name === 'delayMoreThan20' ? [2, 2, 0, 0] : 0,
					stackId: 'delays',
				})}
				classNames={{
					axis: styles.axis,
					grid: styles.grid,
					root: styles.chart,
				}}
				lineProps={series => ({
					dot: series.name === 'delayedPercentage' ? { r: 4 } : false,
					strokeWidth: series.name === 'delayedPercentage' ? 2.5 : 1.5,
				})}
				rightYAxisProps={{
					axisLine: false,
					domain: [0, percentageDomainMaximum],
					tickFormatter: value => `${value}%`,
					tickLine: false,
					tickMargin: 8,
				}}
				series={[
					{ color: 'var(--palette-blue-500)', name: 'delay5To10', type: 'bar' },
					{ color: 'var(--delay-medium)', name: 'delay10To20', type: 'bar' },
					{ color: 'var(--delay-severe)', name: 'delayMoreThan20', type: 'bar' },
					{ color: 'var(--delay-accent)', name: 'delayedPercentage', type: 'line', yAxisId: 'right' },
					{
						color: 'var(--system-muted)',
						name: 'reference',
						strokeDasharray: '7 7',
						type: 'line',
						yAxisId: 'right',
					},
				]}
				xAxisProps={{
					axisLine: false,
					interval: 'preserveStartEnd',
					minTickGap: 42,
					tickLine: false,
					tickMargin: 8,
				}}
				yAxisProps={{
					axisLine: false,
					domain: [0, Math.ceil(maximumDelayedRides * 1.15)],
					tickLine: false,
					tickMargin: 8,
					width: 42,
				}}
				withRightYAxis
			/>
		</section>
	);

	//
}

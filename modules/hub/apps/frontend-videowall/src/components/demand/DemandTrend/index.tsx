'use client';

/* * */

import { type PassengerDemandTrendPoint } from '@tmlmobilidade/go-types-public-info';
import { CompositeChart } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	points: PassengerDemandTrendPoint[]
}

interface ChartPoint {
	current: number
	time: string
	typicalBand: null | number
	typicalLower: null | number
	typicalMedian: null | number
}

/* * */

export function DemandTrend({ points }: Props) {
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
		current: point.passenger_validations_qty,
		time: timeFormatter.format(new Date(point.interval_start)),
		typicalBand: point.typical ? point.typical.upper - point.typical.lower : null,
		typicalLower: point.typical?.lower ?? null,
		typicalMedian: point.typical?.median ?? null,
	})), [points, timeFormatter]);
	const maximumValue = Math.max(1, ...points.flatMap(point => [
		point.passenger_validations_qty,
		point.typical?.upper ?? 0,
	]));

	//
	// F. Render components

	if (chartData.length < 2) return null;

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<p>{t('default:videowall.demand_chart.trend_title')}</p>
				<div className={styles.legend}>
					<span className={styles.currentLegend}>
						{t('default:videowall.demand_chart.current_series')}
					</span>
					<span className={styles.typicalLegend}>
						{t('default:videowall.demand_chart.typical_series')}
					</span>
					<span className={styles.referenceBandLegend}>
						{t('default:videowall.demand_chart.reference_band')}
					</span>
				</div>
			</div>

			<CompositeChart
				curveType="monotone"
				data={chartData}
				dataKey="time"
				gridAxis="y"
				h="100%"
				withDots={false}
				withTooltip={false}
				withYAxis={false}
				yAxisProps={{ domain: [0, Math.ceil(maximumValue * 1.12)] }}
				areaProps={series => series.name === 'typicalLower'
					? { fillOpacity: 0, stackId: 'typical', stroke: 'transparent' }
					: { fillOpacity: 0.16, stackId: 'typical', stroke: 'transparent' }}
				classNames={{
					axis: styles.axis,
					grid: styles.grid,
					root: styles.chart,
				}}
				lineProps={series => series.name === 'typicalMedian'
					? { strokeWidth: 2 }
					: { strokeWidth: 4 }}
				series={[
					{ color: 'transparent', name: 'typicalLower', type: 'area' },
					{ color: 'var(--system-muted)', name: 'typicalBand', type: 'area' },
					{
						color: 'var(--system-muted)',
						name: 'typicalMedian',
						strokeDasharray: '7 7',
						type: 'line',
					},
					{ color: 'var(--palette-blue-500)', name: 'current', type: 'line' },
				]}
				xAxisProps={{
					axisLine: false,
					interval: 'preserveStartEnd',
					minTickGap: 40,
					tickLine: false,
					tickMargin: 8,
				}}
			/>
		</section>
	);

	//
}

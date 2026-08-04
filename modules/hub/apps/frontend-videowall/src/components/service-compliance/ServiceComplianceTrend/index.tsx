'use client';

/* * */

import { type ServiceComplianceTrendPoint } from '@tmlmobilidade/go-types-public-info';
import { CompositeChart } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	points: ServiceComplianceTrendPoint[]
	targetPercentage: number
}

interface ChartPoint {
	compliance: null | number
	executed: number
	reference: number
	scheduled: number
	time: string
}

/* * */

const SCHEDULED_BAR_WIDTH = 54;
const EXECUTED_BAR_WIDTH = 36;
const OVERLAPPING_BAR_GAP = -(SCHEDULED_BAR_WIDTH + EXECUTED_BAR_WIDTH) / 2;

/* * */

export function ServiceComplianceTrend({ points, targetPercentage }: Props) {
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
		compliance: point.compliance_pct,
		executed: point.executed_rides_qty,
		reference: targetPercentage,
		scheduled: point.scheduled_rides_qty,
		time: timeFormatter.format(new Date(point.interval_start)),
	})), [points, targetPercentage, timeFormatter]);
	const maximumRides = Math.max(1, ...points.map(point => point.scheduled_rides_qty));
	const minimumCompliance = Math.min(
		targetPercentage,
		...points.map(point => point.compliance_pct ?? targetPercentage),
	);
	const complianceDomainMinimum = Math.max(0, Math.min(90, Math.floor(minimumCompliance - 2)));

	//
	// F. Render components

	if (chartData.length < 2) return null;

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<p>{t('default:videowall.service_compliance_chart.trend_title')}</p>
				<div className={styles.legend}>
					<span className={styles.scheduledLegend}>
						{t('default:videowall.service_compliance_chart.scheduled_series')}
					</span>
					<span className={styles.executedLegend}>
						{t('default:videowall.service_compliance_chart.executed_series')}
					</span>
					<span className={styles.complianceLegend}>
						{t('default:videowall.service_compliance_chart.compliance_series')}
					</span>
					<span className={styles.referenceLegend}>
						{t('default:videowall.service_compliance_chart.reference_series', '', { value: targetPercentage })}
					</span>
				</div>
			</div>

			<CompositeChart
				composedChartProps={{ barGap: OVERLAPPING_BAR_GAP }}
				curveType="monotone"
				data={chartData}
				dataKey="time"
				gridAxis="y"
				h="100%"
				withDots={true}
				withTooltip={false}
				barProps={series => ({
					barSize: series.name === 'scheduled'
						? SCHEDULED_BAR_WIDTH
						: EXECUTED_BAR_WIDTH,
					fillOpacity: series.name === 'scheduled' ? 0.65 : 1,
					radius: [2, 2, 0, 0],
				})}
				classNames={{
					axis: styles.axis,
					grid: styles.grid,
					root: styles.chart,
				}}
				lineProps={series => ({
					dot: series.name === 'compliance' ? { r: 4 } : false,
					strokeWidth: series.name === 'compliance' ? 2.5 : 1.5,
				})}
				rightYAxisProps={{
					axisLine: false,
					domain: [complianceDomainMinimum, 100],
					tickFormatter: value => `${value}%`,
					tickLine: false,
					tickMargin: 8,
				}}
				series={[
					{ color: 'var(--palette-blue-100)', name: 'scheduled', type: 'bar' },
					{ color: 'var(--palette-blue-500)', name: 'executed', type: 'bar' },
					{ color: 'var(--service-compliance-accent)', name: 'compliance', type: 'line', yAxisId: 'right' },
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
					minTickGap: 28,
					tickLine: false,
					tickMargin: 8,
				}}
				yAxisProps={{
					axisLine: false,
					domain: [0, Math.ceil(maximumRides * 1.12)],
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

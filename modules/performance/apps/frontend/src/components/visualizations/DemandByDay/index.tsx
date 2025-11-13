'use client';

/* * */

import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { transformDemandByAgencyByDay, transformDemandByLineByDay, transformDemandByPatternByDay } from '@/utils/metrics/demandChartData';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { Dates } from '@tmlmobilidade/dates';
import { type DemandByAgencyByDay, type DemandByLineByDay, type DemandByPatternByDay } from '@tmlmobilidade/types';
import { BarChart, LineChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface Filters {
	agencyId?: AgencyType
	dateRange?: {
		endDate: Dates
		startDate: Dates
	}
	lineIds?: string[]
	patternIds?: string[]
}

// filters can be date range, line, agency, pattern
interface DemandByDayProps {
	chartType?: 'bar' | 'dynamic' | 'line'
	filters?: Filters
	groupBy: 'agency' | 'line' | 'pattern'
	height?: number
	isInsideFrame?: boolean
}

/* * */

export function DemandByDay({ chartType = 'dynamic', filters, groupBy, height, isInsideFrame }: DemandByDayProps) {
	//

	// A. Setup variables

	const t = useTranslations();

	const startDate = filters?.dateRange?.startDate || Dates.now('Europe/Lisbon').minus({ days: 7 });
	const endDate = filters?.dateRange?.endDate || Dates.now('Europe/Lisbon');

	const homeContext = useHomeContext();
	const selectedAgency = filters?.agencyId || homeContext.data.selected_agency;

	const daysInRange = useMemo(() => {
		return Math.abs(endDate.diff(startDate, 'day'));
	}, [startDate, endDate]);

	const resolvedChartType = useMemo(() => {
		if (chartType !== 'dynamic') return chartType;
		return daysInRange > 20 ? 'line' : 'bar';
	}, [chartType, daysInRange]);

	// B. Fetch data

	const metricUrl = useMemo(() => {
		let baseUrl = MetricsRoutes.DEMAND_BY_AGENCY_BY_DAY;
		const params = new URLSearchParams();

		// handle group by logic
		if (groupBy === 'line' && filters?.lineIds?.length) {
			baseUrl = MetricsRoutes.DEMAND_BY_LINE_BY_DAY;
			params.set('line_ids', filters.lineIds.join(','));
		}
		else if (groupBy === 'pattern' && filters?.patternIds?.length) {
			baseUrl = MetricsRoutes.DEMAND_BY_PATTERN_BY_DAY;
			params.set('pattern_ids', filters.patternIds.join(','));
		}

		const query = params.toString();
		return query ? `${baseUrl}?${query}` : baseUrl;
	}, [groupBy, filters]);

	const { data } = useSWR<DemandByAgencyByDay[] | DemandByLineByDay[] | DemandByPatternByDay[]>(metricUrl);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data) return { all: { chart: [] }, lastUpdated: null };

		switch (groupBy) {
			case 'line':
				return transformDemandByLineByDay(data as DemandByLineByDay[], startDate, endDate, filters?.lineIds, t);
			case 'pattern':
				return transformDemandByPatternByDay(data as DemandByPatternByDay[], startDate, endDate, filters?.patternIds, t);
			default:
				return transformDemandByAgencyByDay(data as DemandByAgencyByDay[], startDate, endDate, selectedAgency, t);
		}
	}, [data, groupBy, startDate, endDate, selectedAgency, t, filters]);

	const chartData = formattedData.all.chart as { formatted_day_detailed: string, qty?: number }[];
	const hasData = chartData.length > 0;

	const averageDemand = useMemo(() => {
		if (!hasData || chartData.length === 0) return 0;
		const total = chartData.reduce((sum: number, item) => sum + (item.qty || 0), 0);
		return Math.round(total / chartData.length);
	}, [chartData, hasData]);

	const eventReferenceLines = useMemo(() => {
		return formattedData.all.chart
			.filter(item => item.formatted_day_detailed.includes('(')) // contains holiday/notes
			.map((item) => {
				// Extract only what's inside parentheses
				const match = item.formatted_day_detailed.match(/\(([^)]+)\)/);
				const label = match ? match[1] : item.formatted_day_detailed;

				return {
					color: 'var(--color-primary)',
					label: label,
					labelPosition: 'top' as const,
					x: item.formatted_day_detailed,
				};
			});
	}, [formattedData]);

	/**
	 * Calculates optimal Y-axis domain to fill available chart space
	 * @param data Array of chart data points
	 * @param paddingPercent Percentage of padding to add (default: 10%)
	 * @returns [minValue, maxValue] for Y-axis domain
	 */
	const calculateYAxisDomain = (data: { qty?: number }[], paddingPercent = 10): [number, number] => {
		if (!data || data.length === 0) return [0, 100];

		const values = data.map(item => item.qty || 0).filter(val => val > 0);
		if (values.length === 0) return [0, 100];

		const min = Math.min(...values);
		const max = Math.max(...values);

		// If all values are the same, create a small range around the value
		if (min === max) {
			const value = min;
			const range = Math.max(value * 0.1, 10); // 10% of value or minimum 10
			return [Math.max(0, value - range), value + range];
		}

		const range = max - min;
		const padding = (range * paddingPercent) / 100;

		// Calculate bounds with padding
		const lowerBound = Math.max(0, min - padding);
		const upperBound = max + padding;

		// Round to nice numbers for cleaner appearance
		const roundedMin = Math.floor(lowerBound / Math.pow(10, Math.floor(Math.log10(range)) - 1)) * Math.pow(10, Math.floor(Math.log10(range)) - 1);
		const roundedMax = Math.ceil(upperBound / Math.pow(10, Math.floor(Math.log10(range)) - 1)) * Math.pow(10, Math.floor(Math.log10(range)) - 1);

		return [roundedMin, roundedMax];
	};

	const yAxisDomain = useMemo(() => {
		return calculateYAxisDomain(chartData);
	}, [chartData]);

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title="Passageiros transportados por dia">
			{hasData ? (
				<div className={styles.fadeIn}>
					{resolvedChartType === 'line' ? (
						<LineChart
							color="var(--color-primary)"
							curveType="monotone"
							data={chartData}
							dataKey="formatted_day_detailed"
							h={height || 200}
							strokeWidth={5}
							styles={{ referenceLine: { strokeDasharray: '5 5' } }}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: value => getShortLabelFromDetailed(value) }}
							yAxisProps={{ domain: yAxisDomain }}
							referenceLines={[
								{
									color: 'var(--color-system-text-300)',
									label: t('chart.series.average.label', { value: averageDemand }),
									labelPosition: 'insideBottomRight',
									y: averageDemand,
								},
								...eventReferenceLines,
							]}
							series={[
								{
									color: 'var(--color-primary)',
									label: 'Nº de passageiros',
									name: 'qty',
								},
							]}
						/>
					)
						: (
							<BarChart
								color="var(--color-primary)"
								data={chartData}
								dataKey="formatted_day_detailed"
								h={height || 200}
								valueFormatter={v => v.toLocaleString('pt-PT')}
								valueLabelProps={{ fill: 'white', position: 'inside' }}
								withXAxis={true}
								withYAxis={true}
								xAxisProps={{ tickFormatter: value => getShortLabelFromDetailed(value) }}
								// yAxisProps={{ domain: yAxisDomain }}
								series={[
									{
										color: 'var(--color-primary)',
										label: 'Nº de passageiros',
										name: 'qty',
									},
								]}
								withBarValueLabel
							/>
						)}
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</VisualizationWrapper>
	);
}

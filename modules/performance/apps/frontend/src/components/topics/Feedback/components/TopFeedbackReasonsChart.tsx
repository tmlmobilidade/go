/* * */

import type { FeedbackReasonChartSlice, FeedbackReasonTrendChartData } from '@/utils/feedback/feedback-reasons';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { generateColors } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { ChartLegend, LineChart, PieChart } from '@tmlmobilidade/ui';
import { type ComponentProps, useCallback, useMemo, useState } from 'react';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackReasonsChartProps {
	data: FeedbackReasonChartSlice[]
	title: string
	trendData: FeedbackReasonTrendChartData
}

interface TrendSeriesItem {
	name: string
}

interface TrendLegendContentProps {
	payload?: ChartLegendPayload
}

/* * */

const TREND_Y_AXIS_TARGET_TICK_COUNT = 5;
const TREND_LINE_DIMMED_OPACITY = 0.06;

type ChartLegendHighlight = Parameters<ComponentProps<typeof ChartLegend>['onHighlight']>[0];
type ChartLegendPayload = ComponentProps<typeof ChartLegend>['payload'];

function getTrendValues(trendData: FeedbackReasonTrendChartData) {
	const values: number[] = [];

	for (const chartPoint of trendData.chart) {
		for (const seriesName of trendData.series) {
			const value = Number(chartPoint[seriesName] ?? 0);
			if (value > 0) values.push(value);
		}
	}

	return values;
}

function getNiceTickStep(rawStep: number) {
	const magnitude = 10 ** Math.floor(Math.log10(rawStep));
	const normalizedStep = rawStep / magnitude;

	if (normalizedStep <= 1) return magnitude;
	if (normalizedStep <= 2.5) return 2 * magnitude;
	if (normalizedStep <= 7.5) return 5 * magnitude;

	return 10 * magnitude;
}

function getTrendYAxisConfig(values: number[]) {
	if (values.length === 0) return { max: 1, ticks: [0, 1] };

	const maxValue = Math.max(...values);
	const paddedMaxValue = maxValue * 1.12;
	const rawTickStep = Math.max(1, paddedMaxValue / (TREND_Y_AXIS_TARGET_TICK_COUNT - 1));
	const tickStep = getNiceTickStep(rawTickStep);
	const axisMax = Math.max(tickStep, Math.ceil(paddedMaxValue / tickStep) * tickStep);
	const ticks = [];

	for (let tick = 0; tick <= axisMax; tick += tickStep) {
		ticks.push(tick);
	}

	return { max: axisMax, ticks };
}

/* * */

export function TopFeedbackReasonsChart({ data, title, trendData }: TopFeedbackReasonsChartProps) {
	const [hoveredTrendSeries, setHoveredTrendSeries] = useState<null | string>(null);

	const handleTrendLegendHighlight = useCallback((area: ChartLegendHighlight) => {
		setHoveredTrendSeries(area === null ? null : String(area));
	}, []);

	const trendSeries = useMemo(() => {
		const colors = generateColors(trendData.series);

		return trendData.series.map(reason => ({
			color: colors[reason],
			label: reason,
			name: reason,
		}));
	}, [trendData.series]);

	const trendLineProps = useMemo(() => {
		return (series: TrendSeriesItem) => {
			const isDimmed = hoveredTrendSeries !== null && hoveredTrendSeries !== series.name;

			return {
				strokeOpacity: isDimmed ? TREND_LINE_DIMMED_OPACITY : 1,
			};
		};
	}, [hoveredTrendSeries]);

	const renderTrendLegend = useCallback(({ payload }: TrendLegendContentProps) => (
		<ChartLegend
			legendPosition="bottom"
			onHighlight={handleTrendLegendHighlight}
			payload={payload}
			series={trendSeries}
		/>
	), [handleTrendLegendHighlight, trendSeries]);

	const pieCellProps = useCallback((slice: TrendSeriesItem) => ({
		onMouseEnter: () => setHoveredTrendSeries(slice.name),
		onMouseLeave: () => setHoveredTrendSeries(null),
	}), []);

	const trendValues = useMemo(() => getTrendValues(trendData), [trendData]);
	const trendYAxisConfig = useMemo(() => getTrendYAxisConfig(trendValues), [trendValues]);

	if (data.length === 0) return null;

	return (
		<ContainerWrapper className={`${styles.feedbackCard} ${styles.feedbackReasonCard}`} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>{title}</p>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.feedbackReasonVisualizationContainer}>
					<div className={styles.feedbackReasonTrendChart}>
						<LineChart
							curveType="monotone"
							data={trendData.chart}
							dataKey="day_detailed"
							h={260}
							legendProps={{ content: renderTrendLegend, verticalAlign: 'bottom' }}
							lineProps={trendLineProps}
							series={trendSeries}
							strokeWidth={4}
							tickLine="none"
							valueFormatter={value => value.toLocaleString('pt-PT')}
							withDots={false}
							withLegend={true}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: getShortLabelFromDetailed }}
							yAxisProps={{
								allowDecimals: false,
								domain: [0, trendYAxisConfig.max],
								ticks: trendYAxisConfig.ticks,
							}}
						/>
					</div>

					<div className={styles.feedbackReasonPieChart}>
						<PieChart
							cellProps={pieCellProps}
							data={data}
							labelsPosition="outside"
							labelsType="percent"
							size={200}
							tooltipDataSource="segment"
							valueFormatter={value => value.toLocaleString('pt-PT')}
							withLabels
							withLabelsLine
							withTooltip
						/>
					</div>
				</div>
			</div>
		</ContainerWrapper>
	);
}

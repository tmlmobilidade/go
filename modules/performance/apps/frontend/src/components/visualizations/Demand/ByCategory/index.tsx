'use client';

import { StackedLineBarChart } from '@/components/charts/StackedLineBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { buildMetricUrl, PieResult, RawMetricData, StackedResult, transformDemandMetric } from '@/utils/metrics';
import { Dates } from '@tmlmobilidade/dates';
import { PieChart } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface Filters {
	agencyIds: AgencyType[]
	dateRange?: {
		endDate: Dates
		startDate: Dates
	}
	lineIds?: string[]
	patternIds?: string[]
}

interface DemandByCategoryVisualizationProps {
	filters: Filters
	groupBy: 'agency' | 'line' | 'pattern'
	height?: number
	isInsideFrame?: boolean
	timeView: 'annual' | 'daily' | 'monthly'
	title?: string
}

/* * */

export function DemandByCategoryVisualization({ filters, groupBy, height, isInsideFrame, timeView, title }: DemandByCategoryVisualizationProps) {
	//

	// A. Setup variables

	const t = useTranslations();

	const startDate = filters?.dateRange?.startDate || Dates.now('Europe/Lisbon').minus({ days: 7 });
	const endDate = filters?.dateRange?.endDate || Dates.now('Europe/Lisbon');
	const selectedAgencies = filters?.agencyIds;

	// B. Fetch data

	const metricUrl = useMemo(() => {
		const baseConfig = {
			groupBy,
			metricType: 'demand-by-category' as const,
			timeView,
		};

		const metricFilters = {
			endDate: endDate.js_date,
			lineIds: filters?.lineIds,
			patternIds: filters?.patternIds,
			startDate: startDate.js_date,
		};

		return buildMetricUrl(baseConfig, metricFilters);
	}, [groupBy, timeView, selectedAgencies, filters]);

	const { data } = useSWR<RawMetricData[]>(metricUrl);

	//
	// C. Transform data

	const stackedData = useMemo(() => {
		if (!data) return { all: { chart: [], series: [] }, lastUpdated: null };

		return transformDemandMetric(data, {
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			breakdownKey: 'category',
			chartType: 'stacked' as const,
			t,
			timeView,
		});
	}, [data, groupBy, filters, selectedAgencies, startDate, endDate, t, timeView]);

	const formattedPieData = useMemo(() => {
		if (!data) return { all: { chart: [] }, lastUpdated: null };

		return transformDemandMetric(data, {
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			breakdownKey: 'category',
			chartType: 'pie' as const,
			t,
			timeView,
		});
	}, [data, groupBy, selectedAgencies, startDate, endDate, t, timeView]);

	const pieChartData = formattedPieData.all.chart as PieResult['chart'];

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={stackedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<div className={styles.visualizationContainer}>
				<StackedLineBarChart data={stackedData.all as StackedResult} endDate={endDate} height={height} startDate={startDate} style={{ flexGrow: 1 }} timeView={timeView} />
				<PieChart
					data={pieChartData}
					labelsPosition="outside"
					labelsType="percent"
					size={200}
					tooltipDataSource="segment"
					valueFormatter={v => v.toLocaleString('pt-PT')}
					withLabels
					withLabelsLine
					withTooltip
				/>
			</div>

		</VisualizationWrapper>
	);
}

'use client';

/* * */

import { StackedLineBarChart } from '@/components/charts/StackedLineBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricRouteResolver } from '@/utils/metrics/handlers/MetricRouteResolver';
import { type DemandMetricItem, StackedResult, transformDemandMetric } from '@/utils/metrics/unifiedTransforms';
import { Dates } from '@tmlmobilidade/dates';
import { PieChart } from '@tmlmobilidade/ui';
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

interface DemandByProductVisualizationProps {
	filters?: Filters
	groupBy: 'agency' | 'line' | 'pattern'
	height?: number
	isInsideFrame?: boolean
	timeView: 'annual' | 'daily' | 'monthly'
	title?: string
}

/* * */

export function DemandByProductVisualization({ filters, groupBy, height, isInsideFrame, timeView, title }: DemandByProductVisualizationProps) {
	//

	// A. Setup variables

	const t = useTranslations();

	const startDate = filters?.dateRange?.startDate || Dates.now('Europe/Lisbon').minus({ days: 7 });
	const endDate = filters?.dateRange?.endDate || Dates.now('Europe/Lisbon');

	const homeContext = useHomeContext();
	const selectedAgency = filters?.agencyId || homeContext.data.selected_agency;

	// B. Fetch data

	const metricUrl = useMemo(() => {
		const baseConfig = {
			breakdowns: ['product'] as ('product')[],
			groupBy,
			metricType: 'demand' as const,
			timeView,
		};

		const metricFilters = {
			lineIds: filters?.lineIds,
			patternIds: filters?.patternIds,
		};

		return MetricRouteResolver.buildOptimizedMetricUrl(baseConfig, metricFilters);
	}, [groupBy, timeView, selectedAgency, filters]);

	const { data } = useSWR<DemandMetricItem[]>(metricUrl);

	//
	// C. Transform data - Using unified transform function for stacked chart

	const stackedData = useMemo(() => {
		if (!data) return { all: { chart: [], series: [] }, lastUpdated: null };

		let propertyFilter: undefined | { key: string, values?: string[] };

		if (groupBy === 'line' && filters?.lineIds?.length) {
			propertyFilter = { key: 'line_id', values: filters.lineIds };
		}
		else if (groupBy === 'pattern' && filters?.patternIds?.length) {
			propertyFilter = { key: 'pattern_id', values: filters.patternIds };
		}
		else if (groupBy === 'agency' && selectedAgency && selectedAgency !== 'all') {
			propertyFilter = { key: 'agency_id', values: [selectedAgency] };
		}

		return transformDemandMetric(data, {
			chartType: 'stacked' as const,
			endDate,
			propertyFilter,
			startDate,
			t,
			timeView,
			topN: 4, // Show top 4 products + others
		});
	}, [data, groupBy, filters, selectedAgency, startDate, endDate, t, timeView]);

	// Transform data for pie chart using unified transforms
	const formattedPieData = useMemo(() => {
		if (!data) return { all: { chart: [] }, lastUpdated: null };

		// Build property filter same as above
		let propertyFilter: undefined | { key: string, values?: string[] };

		if (groupBy === 'line' && filters?.lineIds?.length) {
			propertyFilter = { key: 'line_id', values: filters.lineIds };
		}
		else if (groupBy === 'pattern' && filters?.patternIds?.length) {
			propertyFilter = { key: 'pattern_id', values: filters.patternIds };
		}
		else if (groupBy === 'agency' && selectedAgency && selectedAgency !== 'all') {
			propertyFilter = { key: 'agency_id', values: [selectedAgency] };
		}

		// Use unified transform function with pie chart type for product totals
		return transformDemandMetric(data, {
			chartType: 'pie' as const,
			endDate,
			propertyFilter,
			startDate,
			t,
			timeView,
			topN: 4, // Show top 4 products + others
		});
	}, [data, groupBy, filters, selectedAgency, startDate, endDate, t, timeView]);

	const pieChartData = formattedPieData.all.chart;

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

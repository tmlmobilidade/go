'use client';

/* * */

import { LineBarChart } from '@/components/charts/LineBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricRouteResolver } from '@/utils/metrics/handlers/MetricRouteResolver';
import { type DemandMetricItem, transformDemandMetric } from '@/utils/metrics/unifiedTransforms';
import { Dates } from '@tmlmobilidade/dates';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

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

interface DemandVisualizationProps {
	filters?: Filters
	groupBy: 'agency' | 'line' | 'pattern'
	height?: number
	isInsideFrame?: boolean
	timeView: 'annual' | 'daily' | 'monthly'
	title?: string
}

/* * */

export function DemandVisualization({
	filters,
	groupBy,
	height,
	isInsideFrame,
	timeView,
	title = 'Passageiros transportados',
}: DemandVisualizationProps) {
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
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data) return { all: { chart: [], sum: 0 }, lastUpdated: null };

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
			chartType: 'timeseries' as const,
			endDate,
			propertyFilter,
			startDate,
			t,
			timeView,
		});
	}, [data, groupBy, filters, selectedAgency, startDate, endDate, t]);

	const chartData = formattedData.all.chart;

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<LineBarChart data={chartData} endDate={endDate} height={height} startDate={startDate} timeView={timeView} />
		</VisualizationWrapper>
	);
}

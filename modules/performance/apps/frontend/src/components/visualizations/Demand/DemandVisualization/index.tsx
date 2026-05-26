'use client';

import { LineBarChart } from '@/components/charts/LineBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { buildMetricUrl, RawMetricData, TimeSeriesResult, transformDemandMetric } from '@/utils/metrics';
import { Dates } from '@tmlmobilidade/dates';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface Filters {
	agencyIds?: AgencyType[]
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
	const selectedAgencies = filters?.agencyIds || homeContext.data.agency_array;

	//
	// B. Fetch data

	const metricUrl = useMemo(() => {
		const baseConfig = {
			groupBy,
			metricType: 'demand' as const,
			timeView,
		};

		const metricFilters = {
			endDate: endDate.js_date,
			lineIds: filters?.lineIds,
			patternIds: filters?.patternIds,
			startDate: startDate.js_date,
		};

		return buildMetricUrl(baseConfig, metricFilters);
	}, [groupBy, timeView, endDate, startDate, filters]);

	const { data } = useSWR<RawMetricData[]>(metricUrl);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data) return { all: { chart: [], sum: 0 }, lastUpdated: null };

		return transformDemandMetric(data, {
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			chartType: 'timeseries' as const,
			t,
			timeView,
		});
	}, [data, groupBy, filters, selectedAgencies, startDate, endDate, t]);

	const chartData = formattedData.all.chart as TimeSeriesResult['chart'];

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<LineBarChart data={chartData} endDate={endDate} height={height} startDate={startDate} timeView={timeView} />
		</VisualizationWrapper>
	);
}

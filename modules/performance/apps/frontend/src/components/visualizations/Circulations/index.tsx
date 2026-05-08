'use client';

import { ProgressBarChart } from '@/components/charts/ProgressBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { buildMetricUrl, RawMetricData, transformDemandMetric } from '@/utils/metrics';
import { ProgressBarResult } from '@/utils/metrics/types/chartResults';
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

export function Circulations({
	filters,
	groupBy,
	height,
	isInsideFrame = true,
	timeView,
	title = 'Circulações planeadas vs executadas',
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
			metricType: 'supply' as const,
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
		if (!data) return { all: { chart: [], series: [], sum: 0 }, lastUpdated: null };

		return transformDemandMetric(data, {
			achievedKey: 'accomplished_rides',
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			chartType: 'bar-progress' as const,
			quantityKey: 'accomplished_rides',
			t,
			timeView,
			totalKey: 'scheduled_rides',
		});
	}, [data, groupBy, filters, selectedAgencies, startDate, endDate, t]);

	const chartData = formattedData.all as ProgressBarResult;

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<ProgressBarChart data={chartData} endDate={endDate} height={height} startDate={startDate} timeView={timeView} yAxisLabel="Nº circulações" />
		</VisualizationWrapper>
	);
}

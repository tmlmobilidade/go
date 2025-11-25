'use client';

import { LineBarChart } from '@/components/charts/LineBarChart';
/* * */

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

export function VmksScheduled({
	filters,
	groupBy,
	height,
	isInsideFrame = true,
	timeView,
	title = 'Vkms planeados',
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

		const transformedData = transformDemandMetric(data, {
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			chartType: 'timeseries',
			quantityKey: 'vkms_scheduled',
			t,
			timeView,
		});

		// Convert meters to kilometers for timeseries chart data
		transformedData.all.chart.forEach((item) => {
			if ('qty' in item && typeof item.qty === 'number') {
				item.qty = item.qty / 1000;
			}
		});

		return transformedData;
	}, [data, groupBy, filters, selectedAgencies, startDate, endDate, t]);

	const chartData = formattedData.all as TimeSeriesResult;

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<LineBarChart data={chartData.chart} endDate={endDate} height={height} startDate={startDate} timeView={timeView} yAxisLabel="Vkms planeados" />
		</VisualizationWrapper>
	);
}

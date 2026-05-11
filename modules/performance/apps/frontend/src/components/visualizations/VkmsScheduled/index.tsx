'use client';

import { ProgressBarChart } from '@/components/charts/ProgressBarChart';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { AgencyType } from '@/constants';
import { useAgenciesContext } from '@/contexts/Agencies.context';
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

export function VmksScheduled({
	filters,
	groupBy,
	height,
	isInsideFrame = true,
	timeView,
	title = 'Vkms planeados vs executados',
}: DemandVisualizationProps) {
	//

	// A. Setup variables

	const t = useTranslations();
	const agenciesContext = useAgenciesContext();

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

	const filteredAgencies = useMemo(() => {
		return selectedAgencies.includes('all' as AgencyType)
			? agenciesContext.data.agencies
			: agenciesContext.data.agencies.filter(agency => selectedAgencies.includes(agency.id));
	}, [agenciesContext.data.agencies, selectedAgencies]);

	const getContractedVkmsForMonth = (monthIndex: number) => {
		return filteredAgencies.reduce((total, agency) => {
			const monthVkms = agency.financials?.vkm_per_month?.[monthIndex] || 0;
			return total + monthVkms;
		}, 0);
	};

	const formattedData = useMemo(() => {
		if (!data) return { all: { chart: [], series: [], sum: 0 }, lastUpdated: null };

		const transformedData = transformDemandMetric(data, {
			achievedKey: 'vkms_observed',
			agencyIds: groupBy === 'agency' ? selectedAgencies : [],
			chartType: 'bar-progress',
			t,
			timeView,
			totalKey: 'vkms_scheduled',
		});

		// // Convert meters to kilometers and add contracted VKMs reference line
		transformedData.all.chart.forEach((item) => {
			// Convert qty from meters to kilometers

			item.achieved = Math.round(item.achieved / 1000);
			item.total = Math.round(item.total / 1000);

			// Add contracted VKMs for the month
			if (timeView === 'monthly' && 'month_index' in item) {
				const contractedVkms = getContractedVkmsForMonth(item.month_index as number);
				item.reference = Math.round(contractedVkms);
			}
		});

		return transformedData;
	}, [data, groupBy, selectedAgencies, t, timeView, filteredAgencies]);

	const chartData = formattedData.all;

	//
	// D. Render components

	return (
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title={title}>
			<ProgressBarChart data={chartData as ProgressBarResult} endDate={endDate} height={height} referenceVariable="Referência" startDate={startDate} timeView={timeView} yAxisLabel="Vkms planeados" />
		</VisualizationWrapper>
	);
}

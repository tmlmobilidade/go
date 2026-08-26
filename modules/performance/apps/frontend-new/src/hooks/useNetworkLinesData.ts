'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { createDemoNetworkLines } from '@/data/demo-performance';
import { createNetworkLineRequestUrls } from '@/utils/network-line-requests';
import { composeNetworkLines } from '@/utils/network-lines';
import { getPerformancePeriods } from '@/utils/performance-comparisons';
import { getComparisonLabelKey } from '@/utils/performance-period-labels';
import { type PassengerDemandByLineItem, type PerformanceNetworkLine, type RidePerformanceByLineItem } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function useNetworkLinesData() {
	//

	// A. Setup variables

	const { t } = useTranslation('default');
	const agenciesContext = useAgenciesContext();
	const demoDataContext = useDemoDataContext();
	const filtersContext = usePerformanceFiltersContext();
	const periods = getPerformancePeriods(
		filtersContext.filters.period.value,
		filtersContext.filters.comparison.value,
	);
	const comparisonLabel = t(getComparisonLabelKey(filtersContext.filters.comparison.value));
	const selectedAgencies = useMemo(() => {
		const selectedIds = new Set(filtersContext.filters.operator.values);
		return agenciesContext.data.agencies.filter(agency => selectedIds.has(agency._id));
	}, [agenciesContext.data.agencies, filtersContext.filters.operator.values]);
	const selectedMetricAgencyIds = useMemo(
		() => selectedAgencies.flatMap(agency => agency.metric_ids),
		[selectedAgencies],
	);
	const requestUrls = createNetworkLineRequestUrls({ metricAgencyIds: selectedMetricAgencyIds, periods });

	//
	// B. Fetch data

	const linesRequest = useSWR<PerformanceNetworkLine[], Error>(
		agenciesContext.flags.is_loading || demoDataContext.flags.is_enabled ? null : requestUrls.lines,
	);
	const demandRequest = useSWR<PassengerDemandByLineItem[], Error>(
		agenciesContext.flags.is_loading || demoDataContext.flags.is_enabled ? null : requestUrls.demand,
	);
	const comparisonDemandRequest = useSWR<PassengerDemandByLineItem[], Error>(
		agenciesContext.flags.is_loading || demoDataContext.flags.is_enabled ? null : requestUrls.comparisonDemand,
	);
	const ridePerformanceRequest = useSWR<RidePerformanceByLineItem[], Error>(
		agenciesContext.flags.is_loading || demoDataContext.flags.is_enabled ? null : requestUrls.ridePerformance,
	);

	//
	// C. Transform data

	const lines = useMemo(() => {
		if (demoDataContext.flags.is_enabled) return createDemoNetworkLines(periods, demoDataContext.data.refresh_index);
		if (!linesRequest.data) return [];

		return composeNetworkLines({
			comparisonDemand: comparisonDemandRequest.data,
			demand: demandRequest.data,
			lines: linesRequest.data,
			ridePerformance: ridePerformanceRequest.data,
			selectedAgencies,
		});
	}, [comparisonDemandRequest.data, demandRequest.data, demoDataContext.data.refresh_index, demoDataContext.flags.is_enabled, linesRequest.data, periods, ridePerformanceRequest.data, selectedAgencies]);

	//
	// D. Return data

	return {
		data: lines,
		flags: {
			has_real_demand: !!demandRequest.data?.length,
			has_real_lines: !!linesRequest.data,
			has_real_operational: !!ridePerformanceRequest.data?.length,
			is_demo: demoDataContext.flags.is_enabled,
			is_loading: !demoDataContext.flags.is_enabled && (agenciesContext.flags.is_loading || linesRequest.isLoading || demandRequest.isLoading || comparisonDemandRequest.isLoading || ridePerformanceRequest.isLoading),
		},
		meta: {
			comparisonLabel,
			periods,
		},
	};

	//
}

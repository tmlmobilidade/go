'use client';

import { Routes } from '@/lib/routes';
/* * */

import type { CachedResource } from '@carrismetropolitana/api-types/common';
import type { DemandMetricsByLine, ServiceMetrics } from '@carrismetropolitana/api-types/metrics';
import type { Line } from '@carrismetropolitana/api-types/network';

import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	actions: {
		getDemandMetricsByLineId: (lineId: string) => DemandMetricsByLine | undefined
		getLineDataById: (lineId: string) => Line | undefined
		getServiceMetricsByLineId: (lineId: string) => ServiceMetrics[] | undefined
	}
	data: {
		demand_metrics: DemandMetricsByLine[]
		lines: Line[]
		service_metrics: ServiceMetrics[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const LinesContext = createContext<LinesContextState | undefined>(undefined);

export function useLinesContext() {
	const context = useContext(LinesContext);
	if (!context) {
		throw new Error('useLinesContext must be used within a LinesContextProvider');
	}
	return context;
}

/* * */

export const LinesContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, error: allLinesError, isLoading: allLinesLoading } = useSWR<Line[]>(`${Routes.CMET_API}/lines`, standardSwrFetcher);
	const { data: demandByLineData, isLoading: demandByLineDataLoading } = useSWR<DemandMetricsByLine[]>(`${Routes.CMET_API}/metrics/demand/by_line`, standardSwrFetcher);
	const { data: serviceMetricsData, isLoading: serviceMetricsLoading } = useSWR<CachedResource<ServiceMetrics[]>>(`${Routes.CMET_API}/metrics/service/all`, standardSwrFetcher);

	//
	// B. Handle actions

	const getLineDataById = (lineId: string) => {
		return allLinesData?.find(line => line.id === lineId);
	};

	const getDemandMetricsByLineId = (lineId: string) => {
		return demandByLineData?.find(demandMetrics => demandMetrics.line_id === lineId);
	};

	const getServiceMetricsByLineId = (lineId: string) => {
		return serviceMetricsData?.data.filter(serviceMetrics => serviceMetrics.line_id === lineId);
	};

	useEffect(() => {
		console.log('HERE =======> ', allLinesData, allLinesError, allLinesLoading);
	}, [allLinesData]);

	//
	// C. Define context value

	const contextValue: LinesContextState = useMemo(() => ({
		actions: {
			getDemandMetricsByLineId,
			getLineDataById,
			getServiceMetricsByLineId,
		},
		data: {
			demand_metrics: demandByLineData || [],
			lines: allLinesData || [],
			service_metrics: serviceMetricsData?.data || [],
		},
		flags: {
			is_loading: allLinesLoading || demandByLineDataLoading || serviceMetricsLoading,
		},
	}), [
		allLinesData,
		allLinesLoading,
		demandByLineData,
		demandByLineDataLoading,
		serviceMetricsData,
		serviceMetricsLoading,
	]);

	//
	// D. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);

	//
};

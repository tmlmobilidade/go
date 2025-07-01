'use client';

import type { CachedResource } from '@carrismetropolitana/api-types/common';
import type { DemandMetricsByLine, ServiceMetrics } from '@carrismetropolitana/api-types/metrics';
import type { Line } from '@carrismetropolitana/api-types/network';

import { Routes } from '@/lib/routes';
import { unauthenticatedFetcher } from '@/utils/http';
import { createContext, useContext, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface LinesContextState {
	actions: {
		getDemandMetricsByLineId: (lineId: string) => DemandMetricsByLine | undefined
		getLineDataById: (lineId: string) => Line | undefined
		getServiceMetricsByLineId: (lineId: string) => ServiceMetrics[] | undefined
		handleDBSync: () => void
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

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<Line[], Error>(`${Routes.CMET_API}/lines`, unauthenticatedFetcher);
	const { data: demandByLineData, isLoading: demandByLineDataLoading } = useSWR<DemandMetricsByLine[], Error>(`${Routes.CMET_API}/metrics/demand/by_line`, unauthenticatedFetcher, { refreshInterval: 300000 });
	const { data: serviceMetricsData, isLoading: serviceMetricsLoading } = useSWR<CachedResource<ServiceMetrics[]>, Error>(`${Routes.CMET_API}/metrics/service/all`, unauthenticatedFetcher);
	console.log('allLinesData', allLinesData);

	//
	// B. Handle actions

	const handleDBSync = () => {
		mutate(`${Routes.CMET_API}/lines`);
		mutate(`${Routes.CMET_API}/metrics/demand/by_line`);
		mutate(`${Routes.CMET_API}/metrics/service/all`);
	};

	const getLineDataById = (lineId: string) => {
		return allLinesData?.find(line => line.id === lineId);
	};

	const getDemandMetricsByLineId = (lineId: string) => {
		return demandByLineData?.find(demandMetrics => demandMetrics.line_id === lineId);
	};

	const getServiceMetricsByLineId = (lineId: string) => {
		return serviceMetricsData?.data.filter(serviceMetrics => serviceMetrics.line_id === lineId);
	};

	//
	// C. Define context value

	const contextValue: LinesContextState = useMemo(() => ({
		actions: {
			getDemandMetricsByLineId,
			getLineDataById,
			getServiceMetricsByLineId,
			handleDBSync,
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

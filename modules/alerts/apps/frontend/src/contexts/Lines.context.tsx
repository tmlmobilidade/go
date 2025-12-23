'use client';

/* * */

import type { CachedResource } from '@carrismetropolitana/api-types/common';
import type { DemandMetricsByLine, ServiceMetrics } from '@carrismetropolitana/api-types/metrics';
import type { Line } from '@carrismetropolitana/api-types/network';

import { type SelectDataItem } from '@tmlmobilidade/ui';
import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
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
		options: SelectDataItem[]
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

const CMET_API = process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2';

export const LinesContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<Line[]>(`${CMET_API}/lines`, standardSwrFetcher);
	const { data: demandByLineData, isLoading: demandByLineDataLoading } = useSWR<DemandMetricsByLine[]>(`${CMET_API}/metrics/demand/by_line`, standardSwrFetcher);
	const { data: serviceMetricsData, isLoading: serviceMetricsLoading } = useSWR<CachedResource<ServiceMetrics[]>>(`${CMET_API}/metrics/service/all`, standardSwrFetcher);

	//
	// B. Handle actions

	const getLineDataById = (lineId: string) => {
		return allLinesData?.find(line => line.id === lineId);
	};

	const getDemandMetricsByLineId = (lineId: string) => {
		return demandByLineData?.find(demandMetrics => demandMetrics.line_id === lineId);
	};

	const getServiceMetricsByLineId = (lineId: string) => {
		return serviceMetricsData?.data.filter(serviceMetrics => serviceMetrics.line_id === Number(lineId));
	};

	//
	// C. Define context value

	const asOptions = useMemo(() => {
		if (!allLinesData) return [];
		return allLinesData.map(line => ({
			label: `${line.short_name} | ${line.long_name}`,
			value: line.id,
		}));
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
			options: asOptions,
			service_metrics: serviceMetricsData?.data || [],
		},
		flags: {
			is_loading: allLinesLoading || demandByLineDataLoading || serviceMetricsLoading,
		},
	}), [
		allLinesData,
		allLinesLoading,
		asOptions,
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

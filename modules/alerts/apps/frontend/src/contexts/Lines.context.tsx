/* eslint-disable @typescript-eslint/naming-convention */
'use client';

/* * */

import type { DemandMetricsByLine, ServiceMetrics } from '@carrismetropolitana/api-types/metrics';
import type { Line } from '@carrismetropolitana/api-types/network';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SelectDataItem } from '@tmlmobilidade/ui';
import { fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	actions: {
		getDemandMetricsByLineId: (lineId: string) => DemandMetricsByLine | undefined
		getLineDataById: (lineId: string) => Line | undefined
		getServiceMetricsByLineId: (lineId: string) => ServiceMetrics[] | undefined
		setRidesFilters: (filters: Partial<RidesFilters>) => void
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

interface LineByHashedTrip {
	line_id: number
	line_long_name: string
	line_short_name: string
}

interface RidesFilters {
	agency_id?: string
	date_end: number
	date_start: number
}

export const LinesContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const defaultDateEnd = Date.now();
	const defaultDateStart = defaultDateEnd - (30 * 24 * 60 * 60 * 1000);

	const [ridesFilters, setRidesFilters] = useState<RidesFilters>({
		date_end: defaultDateEnd,
		date_start: defaultDateStart,
	});

	const linesByRidesFiltersUrl = useMemo(() => {
		// Hashed trips endpoint now supports date/agency filters and aggregates server-side.
		const queryParams = new URLSearchParams({
			date_end: String(ridesFilters.date_end),
			date_start: String(ridesFilters.date_start),
		});

		if (ridesFilters.agency_id) {
			queryParams.append('agency_id', ridesFilters.agency_id);
		}

		return `${API_ROUTES.alerts.HASHED_TRIPS_LIST}?${queryParams.toString()}`;
	}, [ridesFilters.agency_id, ridesFilters.date_end, ridesFilters.date_start]);

	const { data: linesByHashedTripsData, isLoading: linesByHashedTripsLoading } = useSWR<LineByHashedTrip[]>(
		linesByRidesFiltersUrl,
		async () => {
			const linesMap = new Map<number, LineByHashedTrip>();
			const response = await fetchData<LineByHashedTrip[]>(linesByRidesFiltersUrl);
			if (!response.data?.length) return [];

			for (const lineData of response.data) {
				if (linesMap.has(lineData.line_id)) continue;
				linesMap.set(lineData.line_id, {
					line_id: lineData.line_id,
					line_long_name: lineData.line_long_name,
					line_short_name: lineData.line_short_name,
				});
			}

			return Array.from(linesMap.values());
		},
	);

	const allLinesData = useMemo(() => {
		if (!linesByHashedTripsData?.length) return [];

		return linesByHashedTripsData.map(line => ({
			id: String(line.line_id),
			long_name: line.line_long_name,
			short_name: line.line_short_name,
		})) as Line[];
	}, [linesByHashedTripsData]);

	//
	// B. Handle actions

	const getLineDataById = useCallback((lineId: string) => {
		return allLinesData?.find(line => line.id === lineId);
	}, [allLinesData]);

	const getDemandMetricsByLineId = useCallback(() => {
		return undefined;
	}, []);

	const getServiceMetricsByLineId = useCallback(() => {
		return undefined;
	}, []);

	const setRidesFiltersAction = useCallback((filters: Partial<RidesFilters>) => {
		setRidesFilters(prev => ({
			...prev,
			...filters,
		}));
	}, []);

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
			setRidesFilters: setRidesFiltersAction,
		},
		data: {
			demand_metrics: [],
			lines: allLinesData || [],
			options: asOptions,
			service_metrics: [],
		},
		flags: {
			is_loading: linesByHashedTripsLoading,
		},
	}), [
		allLinesData,
		asOptions,
		getDemandMetricsByLineId,
		getLineDataById,
		getServiceMetricsByLineId,
		linesByHashedTripsLoading,
		setRidesFiltersAction,
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

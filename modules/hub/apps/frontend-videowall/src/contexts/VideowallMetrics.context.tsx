'use client';

/* * */

import { DEFAULT_NUMBER_ANIMATION_CONFIG, type NumberAnimationConfig } from '@/types/number-animation';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type VideowallAgencyMetrics, type VideowallMetrics } from '@tmlmobilidade/go-types-public-info';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VideowallMetricsContextState {
	data: {
		agency_metrics: Record<string, VideowallAgencyMetrics>
		metrics: undefined | VideowallMetrics
	}
	flags: {
		has_error: boolean
		is_loading: boolean
		is_validating: boolean
	}
	settings: {
		number_animation: NumberAnimationConfig
	}
}

interface VideowallMetricsContextProviderProps {
	agencyIds: readonly string[]
	numberAnimation?: NumberAnimationConfig
}

/* * */

const VideowallMetricsContext = createContext<undefined | VideowallMetricsContextState>(undefined);

export function useVideowallMetricsContext() {
	const context = useContext(VideowallMetricsContext);

	if (!context) {
		throw new Error('useVideowallMetricsContext must be used within a VideowallMetricsContextProvider');
	}

	return context;
}

/* * */

export const VideowallMetricsContextProvider = ({
	agencyIds,
	children,
	numberAnimation = DEFAULT_NUMBER_ANIMATION_CONFIG,
}: PropsWithChildren<VideowallMetricsContextProviderProps>) => {
	//

	//
	// A. Setup variables

	const agencyIdsQuery = agencyIds.map(encodeURIComponent).join(',');
	const url = `${API_ROUTES.hub.BASE}/v2/metrics/videowall?agency_ids=${agencyIdsQuery}`;

	//
	// B. Fetch data

	const { data: metricsData, error: metricsError, isLoading: metricsLoading, isValidating: metricsValidating } = useSWR<VideowallMetrics, Error>(
		{ credentials: 'omit', url },
		{
			keepPreviousData: true,
			refreshInterval: 15_000,
		},
	);

	//
	// C. Transform data

	const agencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(metricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [metricsData]);

	const contextValue = useMemo<VideowallMetricsContextState>(() => ({
		data: {
			agency_metrics: agencyMetrics,
			metrics: metricsData,
		},
		flags: {
			has_error: Boolean(metricsError),
			is_loading: metricsLoading && metricsData === undefined,
			is_validating: metricsValidating,
		},
		settings: {
			number_animation: numberAnimation,
		},
	}), [agencyMetrics, metricsData, metricsError, metricsLoading, metricsValidating, numberAnimation]);

	//
	// F. Render components

	return (
		<VideowallMetricsContext.Provider value={contextValue}>
			{children}
		</VideowallMetricsContext.Provider>
	);

	//
};

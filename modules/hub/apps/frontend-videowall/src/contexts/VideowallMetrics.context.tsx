'use client';

/* * */

import { VIDEOWALL_DATA_CONFIG, type VideowallDataSource, type VideowallMockScenario, type VideowallMockState } from '@/mocks/videowall/config';
import { createVideowallMockMetrics } from '@/mocks/videowall/create-mock-metrics';
import { DEFAULT_NUMBER_ANIMATION_CONFIG, type NumberAnimationConfig } from '@/types/number-animation';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type DepartureDelayAgencyMetrics, type DepartureDelayMetrics, type PassengerDemandAgencyMetrics, type PassengerDemandMetrics, type ServiceComplianceAgencyMetrics, type ServiceComplianceMetrics, type VideowallAgencyMetrics, type VideowallMetrics, type VkmExecutionAgencyMetrics, type VkmExecutionMetrics } from '@tmlmobilidade/go-types-public-info';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VideowallMetricsContextState {
	data: {
		agency_metrics: Record<string, VideowallAgencyMetrics>
		demand_agency_metrics: Record<string, PassengerDemandAgencyMetrics>
		demand_metrics: PassengerDemandMetrics | undefined
		departure_delay_agency_metrics: Record<string, DepartureDelayAgencyMetrics>
		departure_delay_metrics: DepartureDelayMetrics | undefined
		metrics: undefined | VideowallMetrics
		service_compliance_agency_metrics: Record<string, ServiceComplianceAgencyMetrics>
		service_compliance_metrics: ServiceComplianceMetrics | undefined
		vkm_execution_agency_metrics: Record<string, VkmExecutionAgencyMetrics>
		vkm_execution_metrics: undefined | VkmExecutionMetrics
	}
	flags: {
		has_demand_error: boolean
		has_departure_delay_error: boolean
		has_error: boolean
		has_service_compliance_error: boolean
		has_vkm_execution_error: boolean
		is_demand_loading: boolean
		is_demand_validating: boolean
		is_departure_delay_loading: boolean
		is_departure_delay_validating: boolean
		is_loading: boolean
		is_service_compliance_loading: boolean
		is_service_compliance_validating: boolean
		is_validating: boolean
		is_vkm_execution_loading: boolean
		is_vkm_execution_validating: boolean
	}
	settings: {
		data_source: VideowallDataSource
		mock_scenario: null | VideowallMockScenario
		mock_state: null | VideowallMockState
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
	const demandUrl = `${API_ROUTES.hub.METRICS_PASSENGER_DEMAND}?agency_ids=${agencyIdsQuery}`;
	const url = `${API_ROUTES.hub.METRICS_VIDEOWALL}?agency_ids=${agencyIdsQuery}`;
	const isUsingMockData = VIDEOWALL_DATA_CONFIG.data_source === 'mock';
	const hasVisibleMockState = ['ready', 'validating'].includes(VIDEOWALL_DATA_CONFIG.mock_state);
	const isMockDataVisible = isUsingMockData && hasVisibleMockState;

	//
	// B. Fetch data

	const { data: metricsData, error: metricsError, isLoading: metricsLoading, isValidating: metricsValidating } = useSWR<VideowallMetrics, Error>(
		isUsingMockData ? null : { credentials: 'omit', url },
		{
			keepPreviousData: true,
			refreshInterval: 15_000,
		},
	);
	const { data: demandMetricsData, error: demandMetricsError, isLoading: demandMetricsLoading, isValidating: demandMetricsValidating } = useSWR<PassengerDemandMetrics, Error>(
		isUsingMockData ? null : { credentials: 'omit', url: demandUrl },
		{
			keepPreviousData: true,
			refreshInterval: 15_000,
		},
	);

	//
	// C. Transform data

	const mockData = useMemo(() => createVideowallMockMetrics(
		agencyIds,
		VIDEOWALL_DATA_CONFIG.mock_scenario,
	), [agencyIds]);
	const resolvedMetricsData = isUsingMockData ? isMockDataVisible ? mockData.metrics : undefined : metricsData;
	const resolvedDemandMetricsData = isUsingMockData ? isMockDataVisible ? mockData.demand_metrics : undefined : demandMetricsData;
	const resolvedDepartureDelayMetricsData = isUsingMockData ? isMockDataVisible ? mockData.departure_delay_metrics : undefined : undefined;
	const resolvedServiceComplianceMetricsData = isUsingMockData ? isMockDataVisible ? mockData.service_compliance_metrics : undefined : undefined;
	const resolvedVkmExecutionMetricsData = isUsingMockData ? isMockDataVisible ? mockData.vkm_execution_metrics : undefined : undefined;

	const agencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(resolvedMetricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [resolvedMetricsData]);

	const demandAgencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(resolvedDemandMetricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [resolvedDemandMetricsData]);

	const departureDelayAgencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(resolvedDepartureDelayMetricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [resolvedDepartureDelayMetricsData]);

	const serviceComplianceAgencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(resolvedServiceComplianceMetricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [resolvedServiceComplianceMetricsData]);

	const vkmExecutionAgencyMetrics = useMemo(() => {
		return Object.fromEntries(
			(resolvedVkmExecutionMetricsData?.agencies ?? []).map(item => [item.agency_id, item]),
		);
	}, [resolvedVkmExecutionMetricsData]);

	const contextValue = useMemo<VideowallMetricsContextState>(() => ({
		data: {
			agency_metrics: agencyMetrics,
			demand_agency_metrics: demandAgencyMetrics,
			demand_metrics: resolvedDemandMetricsData,
			departure_delay_agency_metrics: departureDelayAgencyMetrics,
			departure_delay_metrics: resolvedDepartureDelayMetricsData,
			metrics: resolvedMetricsData,
			service_compliance_agency_metrics: serviceComplianceAgencyMetrics,
			service_compliance_metrics: resolvedServiceComplianceMetricsData,
			vkm_execution_agency_metrics: vkmExecutionAgencyMetrics,
			vkm_execution_metrics: resolvedVkmExecutionMetricsData,
		},
		flags: {
			has_demand_error: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'error'
				: Boolean(demandMetricsError),
			has_departure_delay_error: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'error'
				: false,
			has_error: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'error'
				: Boolean(metricsError) && Boolean(demandMetricsError),
			has_service_compliance_error: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'error'
				: false,
			has_vkm_execution_error: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'error'
				: false,
			is_demand_loading: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'loading'
				: demandMetricsLoading && demandMetricsData === undefined && metricsData === undefined,
			is_demand_validating: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'validating'
				: demandMetricsValidating,
			is_departure_delay_loading: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'loading'
				: false,
			is_departure_delay_validating: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'validating'
				: false,
			is_loading: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'loading'
				: metricsLoading && metricsData === undefined,
			is_service_compliance_loading: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'loading'
				: false,
			is_service_compliance_validating: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'validating'
				: false,
			is_validating: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'validating'
				: metricsValidating,
			is_vkm_execution_loading: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'loading'
				: false,
			is_vkm_execution_validating: isUsingMockData
				? VIDEOWALL_DATA_CONFIG.mock_state === 'validating'
				: false,
		},
		settings: {
			data_source: VIDEOWALL_DATA_CONFIG.data_source,
			mock_scenario: isUsingMockData ? VIDEOWALL_DATA_CONFIG.mock_scenario : null,
			mock_state: isUsingMockData ? VIDEOWALL_DATA_CONFIG.mock_state : null,
			number_animation: numberAnimation,
		},
	}), [
		agencyMetrics,
		demandAgencyMetrics,
		demandMetricsData,
		demandMetricsError,
		demandMetricsLoading,
		demandMetricsValidating,
		departureDelayAgencyMetrics,
		metricsData,
		metricsError,
		metricsLoading,
		metricsValidating,
		isUsingMockData,
		numberAnimation,
		resolvedDemandMetricsData,
		resolvedDepartureDelayMetricsData,
		resolvedMetricsData,
		resolvedServiceComplianceMetricsData,
		resolvedVkmExecutionMetricsData,
		serviceComplianceAgencyMetrics,
		vkmExecutionAgencyMetrics,
	]);

	//
	// F. Render components

	return (
		<VideowallMetricsContext.Provider value={contextValue}>
			{children}
		</VideowallMetricsContext.Provider>
	);

	//
};

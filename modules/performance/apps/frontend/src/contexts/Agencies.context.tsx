'use client';

import { AGENCIES, type AgencyType } from '@/constants';
import { MetricsRoutes } from '@/routes';
import { calculateSystemHealthIndex, getSystemStatusInfo, type StatusInfo } from '@/utils/systemStatus';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency as APIAgency, type RealtimeDemand, type RealtimeServiceCompliance } from '@tmlmobilidade/types';
import { useTranslations } from 'next-intl';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface Agency extends APIAgency {
	id: AgencyType
	label: string
}

interface AgenciesContextState {
	data: {
		agencies: Agency[]
		agenciesWithAll: Agency[]
		systemStatuses: Record<string, StatusInfo>
	}
	flags: {
		error: Error | undefined
		loading: boolean
		statusLoading: boolean
	}
}

/* * */

const AgenciesContext = createContext<AgenciesContextState | undefined>(undefined);

export const useAgenciesContext = () => {
	const context = useContext(AgenciesContext);
	if (!context) {
		throw new Error('useAgenciesContext must be used within an AgenciesContextProvider');
	}
	return context;
};

/* * */

export const AgenciesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup state and translations

	const t = useTranslations();
	const [systemStatuses, setSystemStatuses] = useState<Record<string, StatusInfo>>({});
	const targetAgencies = [AGENCIES.AREA_1, AGENCIES.AREA_2, AGENCIES.AREA_3, AGENCIES.AREA_4, 'all'] as const;

	//
	// B. Fetch data

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<APIAgency[], Error>(API_ROUTES.auth.AGENCIES_LIST);
	const { data: serviceComplianceData, error: serviceComplianceError, isLoading: serviceComplianceLoading } = useSWR<RealtimeServiceCompliance[]>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);
	const { data: demandData, error: demandError, isLoading: demandLoading } = useSWR<RealtimeDemand[]>(MetricsRoutes.REALTIME_DEMAND);

	//
	// C. Calculate system statuses

	useEffect(() => {
		if (!serviceComplianceData?.length || !demandData?.length) return;

		const statuses: Record<string, StatusInfo> = {};

		const serviceDataObj = serviceComplianceData[0].data;
		const demandDataObj = demandData[0].data;

		targetAgencies.forEach((agency) => {
			// Merge metrics
			const metricsData: Record<string, { last_week: number, now: number }> = {};

			const serviceData = agency === 'all' ? serviceDataObj.total : serviceDataObj.agencies?.[agency];
			const demandMetric = agency === 'all' ? demandDataObj.total : demandDataObj.agencies?.[agency];

			if (!serviceData || !demandMetric) return;

			for (const [key, value] of Object.entries(serviceData)) {
				metricsData[key] = {
					last_week: value.last_week ?? 0,
					now: value.now ?? 0,
				};
			}

			metricsData['demand'] = {
				last_week: demandMetric.last_week ?? 0,
				now: demandMetric.now ?? 0,
			};

			// Compute global system index
			const globalIndex = calculateSystemHealthIndex(metricsData)?.globalIndex;

			// Transform into friendly status info
			if (globalIndex != null) {
				statuses[agency] = getSystemStatusInfo(globalIndex, t);
			}
		});

		setSystemStatuses(statuses);
	}, [serviceComplianceData, demandData, t]);

	//
	// D. Process agencies data (filtered from API)

	const agencies = useMemo(() => {
		if (!allAgenciesData) return [];

		return allAgenciesData
			.filter(agency => targetAgencies.includes(agency._id as AgencyType))
			.map(agency => ({
				...agency,
				id: agency._id as AgencyType,
				label: t(`agencies.${agency._id}`),
			}));
	}, [allAgenciesData, t, targetAgencies]);

	//
	// E. Process agencies with "all" option

	const agenciesWithAll = useMemo(() => {
		// Only include agencies that have system status calculated
		if (Object.keys(systemStatuses).length === 0) return [];

		const agenciesWithStatus = agencies.filter(agency => systemStatuses[agency.id]);

		// Only add "all" if it has system status
		const result: Agency[] = [];
		if (systemStatuses['all']) {
			result.push({
				id: 'all' as AgencyType,
				label: t('default:agencies.all'),
			} as Agency);
		}

		return [...result, ...agenciesWithStatus];
	}, [agencies, systemStatuses, t]);

	//
	// F. Define context value

	const contextValue: AgenciesContextState = useMemo(() => ({
		data: {
			agencies,
			agenciesWithAll,
			systemStatuses,
		},
		flags: {
			error: allAgenciesError || serviceComplianceError || demandError,
			loading: allAgenciesLoading,
			statusLoading: serviceComplianceLoading || demandLoading,
		},
	}), [
		agencies,
		agenciesWithAll,
		systemStatuses,
		allAgenciesError,
		allAgenciesLoading,
		serviceComplianceError,
		demandError,
		serviceComplianceLoading,
		demandLoading,
	]);

	//
	// G. Render components

	return (
		<AgenciesContext.Provider value={contextValue}>
			{children}
		</AgenciesContext.Provider>
	);

	//
};

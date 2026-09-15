'use client';

/* * */

import { AGENCY_IDS_BY_AREA, type AgencyType } from '@/constants';
import { useAgenciesData } from '@/hooks/use-agencies-data';
import { useRealtimeDemandData } from '@/hooks/use-realtime-demand-data';
import { useRealtimeServiceComplianceData } from '@/hooks/use-realtime-service-compliance-data';
import { getMetricAgencyData } from '@/utils/agencies';
import { calculateSystemHealthIndex, getSystemStatusInfo, type StatusInfo } from '@/utils/systemStatus';
import { type Agency as APIAgency } from '@tmlmobilidade/go-types-core';
import { useTranslations } from 'next-intl';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

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
		error: null | string | undefined
		loading: boolean
		statusLoading: boolean
	}
}

/* * */

const AgenciesContext = createContext<AgenciesContextState | undefined>(undefined);
const TARGET_AGENCIES = [...AGENCY_IDS_BY_AREA, 'all'] as const;

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
	// A. Setup variables

	const t = useTranslations();
	const [systemStatuses, setSystemStatuses] = useState<Record<string, StatusInfo>>({});

	//
	// B. Fetch data

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useAgenciesData();
	const { data: serviceComplianceData, error: serviceComplianceError, isLoading: serviceComplianceLoading } = useRealtimeServiceComplianceData();
	const { data: demandData, error: demandError, isLoading: demandLoading } = useRealtimeDemandData();

	//
	// C. Transform data

	useEffect(() => {
		if (!serviceComplianceData?.length || !demandData?.length) return;

		const statuses: Record<string, StatusInfo> = {};

		const serviceDataObj = serviceComplianceData[0].data;
		const demandDataObj = demandData[0].data;

		TARGET_AGENCIES.forEach((agency) => {
			// Merge metrics
			const metricsData: Record<string, { last_week: number, now: number }> = {};

			const serviceData = agency === 'all' ? serviceDataObj.total : getMetricAgencyData(serviceDataObj.agencies, agency);
			const demandMetric = agency === 'all' ? demandDataObj.total : getMetricAgencyData(demandDataObj.agencies, agency);

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

	const agencies = useMemo(() => {
		if (!allAgenciesData) return [];

		return allAgenciesData
			.filter(agency => AGENCY_IDS_BY_AREA.includes(agency._id as AgencyType))
			.map(agency => ({
				...agency,
				id: agency._id as AgencyType,
				label: t(`agencies.${agency._id}`),
			}))
			.sort((a, b) => AGENCY_IDS_BY_AREA.indexOf(a.id) - AGENCY_IDS_BY_AREA.indexOf(b.id));
	}, [allAgenciesData, t]);

	const agenciesWithAll = useMemo(() => {
		// Only include agencies that have system status calculated
		if (Object.keys(systemStatuses).length === 0) return [];

		const agenciesWithStatus = agencies.filter(agency => systemStatuses[agency.id]);

		// Only add "all" if it has system status
		const result: Agency[] = [];
		if (systemStatuses['all']) {
			result.push({
				id: 'all' as AgencyType,
				label: t('agencies.all'),
			} as Agency);
		}

		return [...result, ...agenciesWithStatus];
	}, [agencies, systemStatuses, t]);

	//
	// D. Define context value

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
	// E. Render components

	return (
		<AgenciesContext.Provider value={contextValue}>
			{children}
		</AgenciesContext.Provider>
	);

	//
};

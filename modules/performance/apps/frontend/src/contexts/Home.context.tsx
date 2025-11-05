'use client';

/* * */

import { OPERATORS, OperatorType } from '@/constants';
import { MetricsRoutes } from '@/routes';
import { calculateSystemHealthIndex, getSystemStatusInfo, StatusInfo } from '@/utils/systemStatus';
import { RealtimeDemand, RealtimeServiceCompliance } from '@go/types';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

/* * */

interface HomeContextState {
	actions: {
		setSelectedOperator: (operator: null | string) => void
	}
	data: {
		selected_operator: null | OperatorType
		systemStatuses: Record<string, StatusInfo>
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const HomeContext = createContext<HomeContextState | undefined>(undefined);

export function useHomeContext() {
	const context = useContext(HomeContext);
	if (!context) {
		throw new Error('useHomeContext must be used within a HomeContextProvider');
	}

	return context;
}

/* * */

export const HomeContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup state

	const t = useTranslations();

	const [selectedOperator, setSelectedOperator] = useState<null | OperatorType>(OPERATORS.ALL);
	const [systemStatuses, setSystemStatuses] = useState<Record<string, StatusInfo>>({});

	//
	// B. Define actions

	const changeSelectedOperator = (operator: null | OperatorType) => {
		setSelectedOperator(operator);
	};

	//
	// Fetch Data

	const { data: serviceComplianceData } = useSWR<RealtimeServiceCompliance[]>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);
	const { data: demandData } = useSWR<RealtimeDemand[]>(MetricsRoutes.REALTIME_DEMAND);

	//
	// Handle actions

	useEffect(() => {
		if (!serviceComplianceData?.length || !demandData?.length) return;

		const statuses: Record<string, StatusInfo> = {};

		Object.values(OPERATORS).forEach((op) => {
			// 1️⃣ Merge metrics
			const metricsData: Record<string, { last_week: number, now: number }> = {};

			const serviceData = op === 'all' ? serviceComplianceData[0].data.total : serviceComplianceData[0].data.operators[op];
			const demandMetric = op === 'all' ? demandData[0].data.total : demandData[0].data.operators[op];

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

			// 2️⃣ Compute global system index
			const globalIndex = calculateSystemHealthIndex(metricsData)?.globalIndex;

			// 3️⃣ Transform into friendly status info
			if (globalIndex != null) {
				statuses[op] = getSystemStatusInfo(globalIndex, t);
			}
		});

		setSystemStatuses(statuses);
	}, [serviceComplianceData, demandData]);

	//
	// D. Define context value

	const contextValue: HomeContextState = {
		actions: {
			setSelectedOperator: changeSelectedOperator,
		},
		data: {
			selected_operator: selectedOperator,
			systemStatuses,
		},
		flags: {
			is_loading: false,
		},
	};

	//
	// E. Render components

	return (
		<HomeContext.Provider value={contextValue}>
			{children}
		</HomeContext.Provider>
	);

	//
};

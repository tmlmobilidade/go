'use client';

/* * */

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { OperationalDate, Plan } from '@tmlmobilidade/types';
import { getOperationalDate } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlanListContextState {
	actions: {
		changeValidFrom: (date: Date | null) => void
		changeValidUntil: (date: Date | null) => void
	}
	data: {
		filtered: Plan[]
		raw: Plan[]
	}
	filters: {
		validFrom: null | OperationalDate
		validUntil: null | OperationalDate
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const PlanListContext = createContext<PlanListContextState | undefined>(undefined);

export const usePlanListContext = () => {
	const context = useContext(PlanListContext);
	if (!context) {
		throw new Error('usePlanListContext must be used within a PlanListContextProvider');
	}
	return context;
};

/* * */

export const PlanListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables
	const [filterValidFrom, setFilterValidFrom] = useState<null | OperationalDate>(null);
	const [filterValidUntil, setFilterValidUntil] = useState<null | OperationalDate>(null);

	//
	// B. Fetch data
	const { data: allPlansData, error: allPlansError, isLoading: allPlansLoading } = useSWR<Plan[], Error>(Routes.API(Routes.PLAN_LIST), swrFetcher);

	//
	// C. Transform data

	const rawPlans = useMemo(() => {
		return allPlansData || [];
	}, [allPlansData]);

	const filteredPlans = useMemo(() => {
		const plans = rawPlans;

		return plans;
	}, [rawPlans]);

	//
	// D. Handle actionsn
	function handleChangeValidFrom(date: Date | null) {
		setFilterValidFrom(date ? getOperationalDate(date) : null);
	}

	function handleChangeValidUntil(date: Date | null) {
		setFilterValidUntil(date ? getOperationalDate(date) : null);
	}

	//
	// E. Define context value

	const contextValue: PlanListContextState = useMemo(() => ({
		actions: {
			changeValidFrom: handleChangeValidFrom,
			changeValidUntil: handleChangeValidUntil,
		},
		data: {
			filtered: filteredPlans,
			raw: rawPlans,
		},
		filters: {
			validFrom: filterValidFrom,
			validUntil: filterValidUntil,
		},
		flags: {
			error: allPlansError,
			isLoading: allPlansLoading,
		},
	}), [
		filteredPlans,
		rawPlans,
		allPlansError,
		allPlansLoading,
		filterValidFrom,
		filterValidUntil,
	]);

	//
	// F. Render components

	return (
		<PlanListContext.Provider value={contextValue}>
			{children}
		</PlanListContext.Provider>
	);

	//
};

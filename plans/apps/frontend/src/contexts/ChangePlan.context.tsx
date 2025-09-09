'use client';

/* * */

import { GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ChangePlanContextState {
	actions: {
		confirmChange: () => Promise<void>
	}
	data: {
		available: GtfsValidation[]
		current: Plan
	}
	flags: {
		can_confirm: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const ChangePlanContext = createContext<ChangePlanContextState | undefined>(undefined);

export function useChangePlanContext() {
	const context = useContext(ChangePlanContext);
	if (!context) {
		throw new Error('useChangePlanContext must be used within a ChangePlanContextProvider');
	}
	return context;
}

/* * */

export const ChangePlanContextProvider = ({ children, plan }: PropsWithChildren<{ plan?: Plan }>) => {
	//

	//
	// A. Setup variables
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[], Error>('/api/validations');

	const availablePlans = useMemo(() => {
		if (!allValidationsData) return [];
		return allValidationsData.filter(item => item.gtfs_agency.agency_id === plan?.gtfs_agency.agency_id);
	}, [allValidationsData, plan]);

	//
	// D. Define context value

	const contextValue: ChangePlanContextState = useMemo(() => {
		return {
			actions: {
				confirmChange: () => Promise.resolve(),
			},
			data: {
				available: availablePlans,
				current: plan,
			},
			flags: {
				can_confirm: plan !== null,
				error: allValidationsError,
				loading: allValidationsLoading,
			},
		};
	}, [availablePlans, plan, allValidationsError, allValidationsLoading]);

	//
	// E. Render components

	return (
		<ChangePlanContext.Provider value={contextValue}>
			{children}
		</ChangePlanContext.Provider>
	);

	//
};

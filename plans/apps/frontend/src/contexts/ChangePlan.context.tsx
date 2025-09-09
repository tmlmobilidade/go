'use client';

/* * */

import { GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface ChangePlanContextState {
	actions: {
		confirmChange: () => Promise<void>
		setSelectedValidation: (value: string) => void
	}
	data: {
		availableValidations: GtfsValidation[]
		current: Plan
		selectedValidation: GtfsValidation | undefined
	}
	flags: {
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
	const [selectedValidation, setSelectedValidation] = useState<GtfsValidation | undefined>(undefined);
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[], Error>('/api/validations');

	//
	// B. Transform data

	const availableValidations = useMemo(() => {
		if (!allValidationsData) return [];
		return allValidationsData.filter(item => item.gtfs_agency.agency_id === plan?.gtfs_agency.agency_id);
	}, [allValidationsData, plan]);

	//
	// C. Handle actions

	const handleSetSelectedValidation = (id: string) => {
		setSelectedValidation(availableValidations.find(item => item._id === id));
	};

	const confirmChange = async () => {
		if (!selectedValidation) return;
		console.log(selectedValidation);
	};

	//
	// D. Define context value

	const contextValue: ChangePlanContextState = useMemo(() => {
		return {
			actions: {
				confirmChange,
				setSelectedValidation: handleSetSelectedValidation,
			},
			data: {
				availableValidations,
				current: plan,
				selectedValidation,
			},
			flags: {
				error: allValidationsError,
				loading: allValidationsLoading,
			},
		};
	}, [availableValidations, plan, allValidationsError, allValidationsLoading, selectedValidation]);

	//
	// E. Render components

	return (
		<ChangePlanContext.Provider value={contextValue}>
			{children}
		</ChangePlanContext.Provider>
	);

	//
};

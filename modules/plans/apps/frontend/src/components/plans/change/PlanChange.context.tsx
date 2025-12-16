'use client';

/* * */

import { closePlanChangeModal } from '@/components/plans/change/PlanChange.modal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { useHandleUpdate } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlanChangeContextState {
	actions: {
		save: () => Promise<void>
		setSelectedValidationId: (value: string) => void
	}
	data: {
		available_validations: GtfsValidation[]
		plan: Plan
		selected_validation_id: string | undefined
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
		isSaving: boolean
	}
}

/* * */

const PlanChangeContext = createContext<PlanChangeContextState | undefined>(undefined);

export function usePlanChangeContext() {
	const context = useContext(PlanChangeContext);
	if (!context) {
		throw new Error('usePlanChangeContext must be used within a PlanChangeContextProvider');
	}
	return context;
}

/* * */

export const PlanChangeContextProvider = ({ children, planId }: PropsWithChildren<{ planId: string }>) => {
	//

	//
	// A. Setup variables

	const [selectedValidationId, setSelectedValidationId] = useState<string | undefined>(undefined);

	//
	// B. Fetch data

	const { mutate: plansList } = useSWR<Plan[]>(API_ROUTES.plans.PLANS_LIST);
	const { data: planData, isLoading: planLoading, mutate: planMutate } = useSWR<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId));
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[]>(API_ROUTES.plans.VALIDATIONS_LIST);

	//
	// C. Transform data

	const availableValidations = useMemo(() => {
		// Skip if data is unavailable
		if (!planData) return [];
		if (!allValidationsData) return [];
		// Filter validations that match the agency
		// of the current plan and are complete
		return allValidationsData.filter((item) => {
			const matchesAgencyId = item.gtfs_agency.agency_id === planData.gtfs_agency.agency_id;
			const isComplete = item.feeder_status === 'complete';
			return matchesAgencyId && isComplete;
		});
	}, [planData, allValidationsData]);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL_CHANGE_GTFS(planData._id), 'POST', { validation_id: selectedValidationId }),
		onSuccess: (updatedItem) => {
			plansList();
			planMutate(updatedItem);
			closePlanChangeModal();
		},
	});

	//
	// D. Define context value

	const contextValue: PlanChangeContextState = useMemo(() => {
		return {
			actions: {
				save: handleSave,
				setSelectedValidationId,
			},
			data: {
				available_validations: availableValidations,
				plan: planData,
				selected_validation_id: selectedValidationId,
			},
			flags: {
				error: allValidationsError,
				isLoading: allValidationsLoading || planLoading,
				isSaving,
			},
		};
	}, [
		availableValidations,
		allValidationsError,
		allValidationsLoading,
		isSaving,
		planData,
		planLoading,
		selectedValidationId,
	]);

	//
	// E. Render components

	return (
		<PlanChangeContext.Provider value={contextValue}>
			{children}
		</PlanChangeContext.Provider>
	);

	//
};

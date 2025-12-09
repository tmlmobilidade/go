'use client';

/* * */

import { CHANGE_PLAN_MODAL_ID } from '@/components/plans/detail/ChangePlanModal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { closeModal, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

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

export const ChangePlanContextProvider = ({ children, plan }: PropsWithChildren<{ plan: Plan }>) => {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);
	const [selectedValidation, setSelectedValidation] = useState<GtfsValidation | undefined>(undefined);
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<GtfsValidation[], Error>(API_ROUTES.plans.VALIDATIONS_LIST);

	//
	// B. Transform data

	const availableValidations = useMemo(() => {
		if (!allValidationsData) return [];
		return allValidationsData.filter(item => item.gtfs_agency.agency_id === plan?.gtfs_agency.agency_id && item.feeder_status === 'complete');
	}, [allValidationsData, plan]);

	//
	// C. Handle actions

	const handleSetSelectedValidation = (id: string) => {
		setSelectedValidation(availableValidations.find(item => item._id === id));
	};

	const confirmChange = async () => {
		if (!selectedValidation) return;
		setIsLoading(true);

		//
		// Change the GTFS of the plan
		const response = await fetchData(API_ROUTES.plans.PLANS_DETAIL_CHANGE_GTFS(plan._id), 'POST', {
			validation_id: selectedValidation._id,
		});

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao alterar plano' });
			setIsLoading(false);
			return;
		}

		useToast.success({ message: 'Plano alterado com sucesso', title: 'Sucesso' });

		//
		// Mutate the plans list

		mutate(API_ROUTES.plans.PLANS_LIST);

		//
		// Close the modal

		closeModal(CHANGE_PLAN_MODAL_ID);

		//
		// Reset the state

		setIsLoading(false);

		//
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
				loading: allValidationsLoading || isLoading,
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

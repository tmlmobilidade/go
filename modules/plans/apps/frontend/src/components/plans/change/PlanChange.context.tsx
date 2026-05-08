/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { closePlanChangeModal } from '@/components/plans/change/PlanChange.modal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { useHandleUpdate, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

interface PlanChangeContextState {
	actions: {
		save: () => Promise<void>
		setSelectedValidationId: (value: string) => void
	}
	data: {
		available_validations: GtfsValidation[]
		plan: Plan | undefined
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
		if (!planData) return [];
		if (!allValidationsData) return [];

		return allValidationsData.filter((item) => {
			const matchesAgencyId = item.gtfs_agency.agency_id === planData.gtfs_agency.agency_id;
			const isComplete = item.processing_status === 'complete';
			const isValid = item.validity_status === 'valid';
			return matchesAgencyId && isComplete && isValid;
		});
	}, [planData, allValidationsData]);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate<Plan>({
		fetchFn: async () => {
			if (!selectedValidationId) {
				useToast.error({ message: 'Selecione uma validação antes de alterar o plano.', title: 'Erro' });
				return;
			}

			if (!planData || !allValidationsData) {
				useToast.error({ message: 'Dados do plano ou validações indisponíveis.', title: 'Erro' });
				return;
			}

			const selectedValidation = availableValidations.find(item => item._id === selectedValidationId) ?? allValidationsData?.find(item => item._id === selectedValidationId);

			if (!selectedValidation) {
				useToast.error({ message: 'Validação selecionada não encontrada.', title: 'Erro' });
				return;
			}

			if (!selectedValidation.summary || selectedValidation.summary.total_errors > 0) {
				useToast.error({ message: 'Não é possível alterar o plano com uma validação que contém erros.', title: 'Erro' });
				return;
			}

			return await fetchData<Plan>(
				API_ROUTES.plans.PLANS_DETAIL_CHANGE_GTFS(planId),
				'POST',
				{ validation_id: selectedValidationId },
			);
		},
		onSuccess: (updatedItem) => {
			plansList();
			planMutate(updatedItem);
			closePlanChangeModal();
		},
	});

	//
	// E. Define context value

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
		planData,
		planLoading,
		selectedValidationId,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<PlanChangeContext.Provider value={contextValue}>
			{children}
		</PlanChangeContext.Provider>
	);
};

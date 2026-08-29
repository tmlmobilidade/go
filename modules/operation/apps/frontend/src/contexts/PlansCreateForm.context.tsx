'use client';

/* * */

import { usePlansListData } from '@/components/plans/list/use-plans-list-data';
import { CREATE_PLAN_MODAL_ID } from '@/components/validations/detail/ApprovePlanModal';
import { REQUEST_APPROVAL_MODAL_ID } from '@/components/validations/detail/RequestApprovalModal';
import { useValidationsDetailData } from '@/components/validations/detail/use-validations-detail-data';
import { useValidationsListData } from '@/components/validations/list/use-validations-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type GtfsValidation, type Plan } from '@tmlmobilidade/go-types-operation';
import { closeModal, fetchApiData, useHandleUpdate } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface PlansCreateContextState {
	actions: {
		createPlan: () => Promise<void>
		requestApproval: () => Promise<void>
	}
	data: {
		validation: GtfsValidation | null
	}
	flags: {
		canCreatePlan: boolean
		error: Error | null
		loading: boolean
	}
}

/* * */

const PlansCreateContext = createContext<PlansCreateContextState | undefined>(undefined);

export function usePlansCreateContext() {
	const context = useContext(PlansCreateContext);
	if (!context) {
		throw new Error('usePlansCreateContext must be used within a PlansCreateContextProvider');
	}
	return context;
}

/* * */

export const PlansCreateContextProvider = ({ children, validationId }: PropsWithChildren<{ validationId: string }>) => {
	//

	//
	// A. Setup variables

	const { mutate: plansListMutate } = usePlansListData();
	const { mutate: validationsListMutate } = useValidationsListData();

	//
	// B. Fetch data

	const { data: validationData, error: validationError, isLoading: validationLoading, mutate: validationMutate } = useValidationsDetailData(validationId);

	//
	// C. Handle actions

	const { action: createPlan, isError: createPlanError, isLoading: isCreatingPlan } = useHandleUpdate<Plan>({
		fetchFn: async () => await fetchApiData<Plan>({
			body: { validation_id: validationId },
			method: 'POST',
			url: API_ROUTES.operation.PLANS_CREATE,
		}),
		labels: {
			error_title: 'Erro ao aprovar plano',
			success_message: 'Plano aprovado com sucesso',
		},
		onSuccess: (response) => {
			plansListMutate();
			closeModal(CREATE_PLAN_MODAL_ID);

			if (response.data) {
				window.location.href = PAGE_ROUTES.operation.APPROVED_DETAIL(response.data._id);
			}
		},
	});

	const { action: requestApproval, isError: requestApprovalError, isLoading: isRequestingApproval } = useHandleUpdate<GtfsValidation>({
		fetchFn: async () => await fetchApiData<GtfsValidation>({
			url: API_ROUTES.operation.VALIDATIONS_DETAIL_REQUEST_APPROVAL(validationId),
		}),
		labels: {
			error_title: 'Erro ao solicitar aprovação à TML',
			success_message: 'Aprovação à TML solicitada com sucesso',
		},
		onSuccess: () => {
			validationMutate();
			validationsListMutate();
			closeModal(REQUEST_APPROVAL_MODAL_ID);
		},
	});

	//
	// D. Define context value

	const contextValue: PlansCreateContextState = useMemo(() => ({
		actions: {
			createPlan,
			requestApproval,
		},
		data: {
			validation: validationData,
		},
		flags: {
			canCreatePlan: !!validationData,
			error: createPlanError ?? requestApprovalError ?? (validationError ? new Error(validationError) : null),
			loading: validationLoading || isCreatingPlan || isRequestingApproval,
		},
	}), [createPlan, createPlanError, isCreatingPlan, isRequestingApproval, requestApproval, requestApprovalError, validationData, validationError, validationLoading]);

	//
	// E. Render components

	return (
		<PlansCreateContext.Provider value={contextValue}>
			{children}
		</PlansCreateContext.Provider>
	);

	//
};

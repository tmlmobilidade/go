/* * */

import { CREATE_PLAN_MODAL_ID } from '@/components/validations/detail/ApprovePlanModal';
import { REQUEST_APPROVAL_MODAL_ID } from '@/components/validations/detail/RequestApprovalModal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type GtfsValidation, type Plan } from '@tmlmobilidade/types';
import { closeModal, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

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

	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState<null | string>(null);

	//
	// B. Fetch data

	const { data: validationData, error: validationError } = useSWR<GtfsValidation>(validationId && API_ROUTES.plans.VALIDATIONS_DETAIL(validationId));

	//
	// C. Handle actions

	const createPlan = async () => {
		setIsLoading(true);
		setIsError(null);

		const response = await fetchData<Plan>(API_ROUTES.plans.PLANS_LIST, 'POST', { validation_id: validationId });

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao aprovar plano' });
			setIsLoading(false);
			setIsError(response.error);
			return;
		}

		useToast.success({ message: 'Plano aprovado com sucesso', title: 'Sucesso' });

		mutate(API_ROUTES.plans.PLANS_LIST);

		setIsLoading(false);
		closeModal(CREATE_PLAN_MODAL_ID);

		if (response.data) {
			window.location.href = PAGE_ROUTES.plans.APPROVED_DETAIL(response.data._id);
		}
	};

	const requestApproval = async () => {
		setIsLoading(true);
		setIsError(null);

		const response = await fetchData<Plan>(API_ROUTES.plans.VALIDATIONS_DETAIL_REQUEST_APPROVAL(validationId), 'GET');

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao solicitar aprovação à TML' });
			setIsLoading(false);
			setIsError(response.error);
			return;
		}

		useToast.success({ message: 'Aprovação à TML solicitada com sucesso', title: 'Sucesso' });

		setIsLoading(false);
		closeModal(REQUEST_APPROVAL_MODAL_ID);
	};

	//
	// D. Define context value

	const contextValue: PlansCreateContextState = useMemo(() => {
		return {
			actions: {
				createPlan,
				requestApproval,
			},
			data: {
				validation: validationData,
			},
			flags: {
				canCreatePlan: validationData !== null,
				error: validationError || isError,
				loading: isLoading,
			},
		};
	}, [validationData, isLoading]);

	//
	// E. Render components

	return (
		<PlansCreateContext.Provider value={contextValue}>
			{children}
		</PlansCreateContext.Provider>
	);

	//
};

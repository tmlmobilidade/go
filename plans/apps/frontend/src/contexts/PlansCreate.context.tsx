/* * */

import { CREATE_PLAN_MODAL_ID } from '@/components/validations/detail/ConvertToPlanModal';
import { type Plan, type Validation } from '@tmlmobilidade/types';
import { closeModal, useToast } from '@tmlmobilidade/ui';
import { fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface PlansCreateContextState {
	actions: {
		createPlan: () => Promise<void>
	}
	data: {
		validation: null | Validation
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

	const { data: validationData, error: validationError } = useSWR<Validation>(validationId && `/api/validations/${validationId}`, swrFetcher);

	//
	// C. Handle actions

	const createPlan = async () => {
		setIsLoading(true);
		setIsError(null);

		const response = await fetchData<Plan>('/api/plans', 'POST', { validation_id: validationId });

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao criar validação' });
			setIsLoading(false);
			setIsError(response.error);
			return;
		}

		useToast.success({ message: 'Plano criado com sucesso', title: 'Sucesso' });

		mutate('/api/plans');

		setIsLoading(false);
		closeModal(CREATE_PLAN_MODAL_ID);

		if (response.data) {
			window.location.href = `/plans/${response.data._id}`;
		}
	};

	//
	// D. Define context value

	const contextValue: PlansCreateContextState = useMemo(() => {
		return {
			actions: {
				createPlan,
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

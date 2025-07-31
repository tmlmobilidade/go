'use client';

/* * */

import { Routes } from '@/lib/routes';
import { Plan, UpdatePlanSchema } from '@tmlmobilidade/types';
import { File } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { convertObject, fetchData, keepUrlParams, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlansDetailContextState {
	actions: {
		approvePlan: () => void
		savePlan: () => void
		toggleLock: () => void
	}
	data: {
		form: UseFormReturnType<Plan>
		id: string
		operation_file: File | null
		plan: null | Plan
	}
	flags: {
		error: Error | null
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

/* * */

const PlansDetailContext = createContext<PlansDetailContextState | undefined>(undefined);

export function usePlansDetailContext() {
	const context = useContext(PlansDetailContext);
	if (!context) {
		throw new Error('usePlansDetailContext must be used within a PlansDetailContextProvider');
	}

	return context;
}

/* * */

export const PlansDetailContextProvider = ({ children, planId }: { children: React.ReactNode, planId: string }) => {
	//

	//
	// A. Setup variables

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { data: planData, error: planError, isLoading: planLoading, mutate: planMutate } = useSWR<Plan>(`/api/plans/${planId}`, swrFetcher);
	const { data: operationFileData, error: operationFileError, isLoading: operationFileLoading } = useSWR<File>(`/api/plans/${planId}/operation-file`, swrFetcher);

	//
	// C. Setup form

	const form = useForm<Plan>({
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!planData) return;
		form.initialize(planData);
	}, [planData]);

	useEffect(() => {
		if (!planError) return;
		useToast.error({ message: planError.message, title: 'Erro ao carregar validação' });
		window.location.href = keepUrlParams('/plans');
	}, [planLoading]);

	//
	// E. Define actions

	const handleApprovePlan = () => {
		console.log('approvePlan');
	};

	const handleToggleLock = async () => {
		try {
			setIsSaving(true);
			const response = await fetchData<Plan>(`/api/plans/${planId}/toggle-lock`);
			if (response.error) {
				useToast.error({ message: response.error, title: 'Erro ao bloquear plano' });
				setIsSaving(false);
				return;
			}
			planMutate(response.data);
			setIsSaving(false);
		}
		catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao bloquear plano' });
			setIsSaving(false);
		}
	};

	const handleSavePlan = async () => {
		setIsSaving(true);

		const body = convertObject(form.getValues(), UpdatePlanSchema);

		const toastId = useToast.loading({
			message: 'A guardar plano...',
			title: 'A guardar plano',
		});

		const response = await fetchData<Plan>(Routes.API(Routes.PLAN_DETAIL(planId)), 'PUT', body);
		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao guardar plano',
			});
			useToast.hide(toastId);
			setIsSaving(false);
			return;
		}

		useToast.hide(toastId);

		useToast.success({
			message: 'Plano guardado com sucesso',
			title: 'Plano guardado',
		});

		setIsSaving(false);
	};

	//
	// E. Define context value
	const contextValue: PlansDetailContextState = useMemo(() => ({
		actions: {
			approvePlan: handleApprovePlan,
			savePlan: handleSavePlan,
			toggleLock: handleToggleLock,
		},
		data: {
			form,
			id: planId,
			operation_file: operationFileData,
			plan: planData,
		},
		flags: {
			error: planError || operationFileError,
			loading: planLoading || operationFileLoading,
			read_only: planData?.is_locked || planLoading || operationFileLoading,
			saving: isSaving,
		},
	}), [
		planData,
		operationFileData,
		planError,
		operationFileError,
		planLoading,
		operationFileLoading,
		planId,
		form,
	]);

	//
	// F. Render Components

	return (
		<PlansDetailContext.Provider value={contextValue}>
			{children}
		</PlansDetailContext.Provider>
	);

	//
};

'use client';

/* * */

import { Routes } from '@/lib/routes';
import { Plan, PlanSchema, UpdatePlanSchema } from '@tmlmobilidade/types';
import { File } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface PlanDetailContextState {
	actions: {
		approvePlan: () => void
		savePlan: () => void
		toggleLock: () => void
	}
	data: {
		form: UseFormReturnType<Plan & { file: File }>
		id: string | undefined
		plan: Plan & { file: File }
	}
	flags: {
		isLoading: boolean
		isReadOnly: boolean
		isSaving: boolean
	}
}

const PlanDetailContext = createContext<PlanDetailContextState | undefined>(undefined);

export function usePlanDetailContext() {
	const context = useContext(PlanDetailContext);
	if (!context) {
		throw new Error('usePlanDetailContext must be used within a PlanDetailContextProvider');
	}

	return context;
}

export const PlanDetailContextProvider = ({ children, planId }: { children: React.ReactNode, planId: string }) => {
	//
	// A. State Management
	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	const { data: plan, error, isLoading } = useSWR<Plan & { file: File }>(Routes.API(Routes.PLAN_DETAIL(planId)), swrFetcher);

	//
	// B. Define form
	const form = useForm<Plan & { file: File }>({
		validate: zodResolver(PlanSchema) as FormValidateInput<Plan & { file: File }>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	useEffect(() => {
		if (!plan) return;

		form.initialize(plan);
	}, [plan]);

	useEffect(() => {
		if (!error) return;

		useToast.error({
			message: error.message,
			title: 'Erro ao carregar plano',
		});

		router.replace(Routes.PLAN_LIST);
	}, [error]);

	//
	// D. Define actions
	const handleApprovePlan = () => {
		console.log('approvePlan');
	};

	const handleToggleLock = async () => {
		try {
			// Optimistically update the UI
			const optimisticData = { ...plan, is_locked: !plan.is_locked };
			mutate(Routes.API(Routes.PLAN_DETAIL(planId)), optimisticData, false);

			const response = await fetchData<Plan>(Routes.API(Routes.PLAN_DETAIL(planId)), 'PUT', {
				is_locked: !plan.is_locked,
			});

			if (response.error) {
				// Revert optimistic update on error
				mutate(Routes.API(Routes.PLAN_DETAIL(planId)));
				useToast.error({
					message: response.error,
					title: 'Erro ao bloquear plano',
				});
				return;
			}

			// Update with actual server response
			mutate(Routes.API(Routes.PLAN_DETAIL(planId)), response.data);
			mutate(Routes.API(Routes.PLAN_LIST));
		}
		catch (error) {
			// Revert optimistic update on error
			mutate(Routes.API(Routes.PLAN_DETAIL(planId)));
			useToast.error({
				message: error,
				title: 'Erro ao bloquear plano',
			});
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

		mutate(Routes.API(Routes.PLAN_DETAIL(planId)), response.data);
		mutate(Routes.API(Routes.PLAN_LIST));

		useToast.hide(toastId);
		useToast.success({
			message: 'Plano guardado com sucesso',
			title: 'Plano guardado',
		});

		setIsSaving(false);
	};

	//
	// E. Define context value
	const contextValue: PlanDetailContextState = useMemo(() => {
		return {
			actions: {
				approvePlan: handleApprovePlan,
				savePlan: handleSavePlan,
				toggleLock: handleToggleLock,
			},
			data: {
				form,
				id: planId,
				plan,
			},
			flags: {
				isLoading: isLoading || !plan || !form.initialized,
				isReadOnly: plan?.is_locked ?? false,
				isSaving,
			},
		};
	}, [isLoading, plan, planId, form]);

	// F. Render Components
	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);
};

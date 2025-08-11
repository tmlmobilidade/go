'use client';

/* * */

import { validatePlanUpdateValues } from '@/utils/validate-plan-update-values';
import { type File, type OperationalDate, type Plan, type UpdatePlanDto } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { Dates, fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlansDetailContextState {
	actions: {
		approvePlan: () => void
		controllerReprocessPlan: () => void
		savePlan: () => void
		toggleLock: () => void
	}
	data: {
		form: UseFormReturnType<UpdatePlanDto>
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

export const PlansDetailContextProvider = ({ children, planId }: PropsWithChildren<{ planId: string }>) => {
	//

	//
	// A. Setup variables

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { data: planData, error: planError, isLoading: planLoading, mutate: planMutate } = useSWR<Plan>(`/api/plans/${planId}`, swrFetcher, { refreshInterval: 5000 });
	const { data: operationFileData, error: operationFileError, isLoading: operationFileLoading, mutate: fileMutate } = useSWR<File>(`/api/plans/${planId}/operation-file`, swrFetcher);

	//
	// C. Setup form

	const form = useForm<UpdatePlanDto>({
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!planData) return;
		form.initialize({
			...planData,
			gtfs_feed_info: {
				...planData.gtfs_feed_info,
				feed_end_date: Dates
					.fromOperationalDate(planData.gtfs_feed_info.feed_end_date, 'Europe/Lisbon')
					.toFormat('yyyy-MM-dd') as OperationalDate,
				feed_start_date: Dates
					.fromOperationalDate(planData.gtfs_feed_info.feed_start_date, 'Europe/Lisbon')
					.toFormat('yyyy-MM-dd') as OperationalDate,
			},
		});
	}, [planData]);

	useEffect(() => {
		if (!planError) return;
		useToast.error({ message: planError.message, title: 'Erro ao abrir plano' });
	}, [planLoading]);

	//
	// E. Handle actions

	const handleApprovePlan = () => {
		console.log('approvePlan');
	};

	const handleControllerReprocessPlan = async () => {
		try {
			setIsSaving(true);
			const response = await fetchData<Plan>(`/api/plans/${planId}/controller-reprocess`);
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao reprocessar plano',
				});
			}
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao reprocessar plano',
			});
		}
		finally {
			planMutate();
			setIsSaving(false);
		}
	};

	const handleSavePlan = async () => {
		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar plano',
		});
		try {
			const preparedValues = validatePlanUpdateValues(form.getValues());
			const response = await fetchData<Plan>(`/api/plans/${planId}`, 'PUT', preparedValues);
			if (response.error) {
				return useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao guardar alterações',
					type: 'error',
				});
			}
			useToast.update(toastId, {
				loading: false,
				message: 'As alterações serão refletidas em breve.',
				title: 'Plano guardado com sucesso',
				type: 'success',
			});
			form.resetDirty();
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao guardar alterações',
				type: 'error',
			});
		}
		finally {
			planMutate();
			fileMutate();
			setIsSaving(false);
		}
	};

	const handleToggleLock = async () => {
		try {
			const response = await fetchData<Plan>(`/api/plans/${planId}/toggle-lock`);
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao bloquear plano',
				});
			}
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao bloquear plano',
			});
		}
		finally {
			planMutate();
		}
	};

	//
	// F. Define context value

	const contextValue: PlansDetailContextState = useMemo(() => ({
		actions: {
			approvePlan: handleApprovePlan,
			controllerReprocessPlan: handleControllerReprocessPlan,
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
			read_only: planData?.is_locked || planLoading || operationFileLoading || isSaving,
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
	// G. Render components

	return (
		<PlansDetailContext.Provider value={contextValue}>
			{children}
		</PlansDetailContext.Provider>
	);

	//
};

'use client';

/* * */

import { Routes } from '@/lib/routes';
import { Plan } from '@tmlmobilidade/types';
import { File } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { Dates, fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface PlanDetailContextState {
	actions: {
		approvePlan: () => void
		editDate: (type: 'end' | 'start') => (value: string) => void
		toggleLock: () => void
	}
	data: {
		id: string | undefined
		plan: Plan & { file: File }
	}
	flags: {
		isLoading: boolean
		isReadOnly: boolean
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

	const { data: plan, error, isLoading } = useSWR<Plan & { file: File }>(Routes.API(Routes.PLAN_DETAIL(planId)), swrFetcher);

	//
	// C. Transform Data

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
	const handleEditDate = (type: 'end' | 'start') => async (value: string) => {
		try {
			// Optimistically update the UI
			const optimisticData = {
				...plan,
				gtfs_feed_info: {
					...plan.gtfs_feed_info,
					[type === 'start' ? 'feed_start_date' : 'feed_end_date']: Dates.fromISO(value).unix_timestamp,
				},
			};
			mutate(Routes.API(Routes.PLAN_DETAIL(planId)), optimisticData, false);

			const response = await fetchData<Plan>(Routes.API(Routes.PLAN_DETAIL(planId)), 'PUT', {
				[type === 'start' ? 'feed_start_date' : 'feed_end_date']: Dates.fromISO(value).unix_timestamp,
			});

			if (response.error) {
				// Revert optimistic update on error
				mutate(Routes.API(Routes.PLAN_DETAIL(planId)));
				useToast.error({
					message: response.error,
					title: 'Erro ao atualizar data',
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
				title: 'Erro ao atualizar data',
			});
		}
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

	//
	// E. Define context value
	const contextValue: PlanDetailContextState = useMemo(() => {
		return {
			actions: {
				approvePlan: handleApprovePlan,
				editDate: handleEditDate,
				toggleLock: handleToggleLock,
			},
			data: {
				id: planId,
				plan,
			},
			flags: {
				isLoading: isLoading || !plan,
				isReadOnly: plan?.is_locked ?? false,
			},
		};
	}, [isLoading, plan, planId]);

	// F. Render Components
	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);
};

'use client';

/* * */

import { Routes } from '@/lib/routes';
import { Plan } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PlanDetailContextState {
	data: {
		id: string | undefined
		plan: Plan
	}
	flags: {
		isReadOnly: boolean
		loading: boolean
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

	const { data: plan, error, isLoading } = useSWR<Plan>(Routes.API(Routes.PLAN_DETAIL(planId)), swrFetcher);

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

	//
	// E. Define context value
	const contextValue: PlanDetailContextState = useMemo(() => {
		return {
			data: {
				id: planId,
				plan,
			},
			flags: {
				isReadOnly: plan?.is_locked ?? false,
				loading: isLoading,
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

'use client';

/* * */

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { CreatePlanDto, CreatePlanSchema, Plan, PlanSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import router from 'next/router';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export enum PlanDetailMode {
	EDIT = 'edit',
	NEW = 'new',
}

interface PlanDetailContextState {
	actions: {
		createPlan: () => void
		toggleLock: () => void
	}
	data: {
		agencies: { label: string, value: string }[]
		form: UseFormReturnType<CreatePlanDto>
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: PlanDetailMode
	}
}

const emptyPlan: CreatePlanDto = {
	agency_id: undefined,
	feeder_status: 'waiting',
	is_approved: false,
	is_locked: false,
	valid_from: undefined,
	valid_until: undefined,
};
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
	const { data: plan, error, isLoading } = useSWR<Plan>(planId === 'new' ? null : Routes.API(Routes.PLAN_DETAIL(planId)), swrFetcher);
	// const { data: agencies, error: agenciesError, isLoading: agenciesLoading } = useSWR<Agency[]>(Routes.API(Routes.AGENCIES), swrFetcher);

	//
	// B. Define form
	const form = useForm<CreatePlanDto>({
		initialValues: planId === PlanDetailMode.NEW ? emptyPlan : plan,
		validate: zodResolver(planId === PlanDetailMode.NEW ? CreatePlanSchema : PlanSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data
	useEffect(() => {
		if (!plan) return;

		form.reset();
		form.setValues(plan);
		form.resetDirty();
	}, [plan]);

	useEffect(() => {
		if (!error) return;

		useToast.error({
			message: error.message,
			title: 'Erro ao carregar plano',
		});

		router.replace(Routes.PLAN_LIST);
	}, [error]);

	const availableAgencies = useMemo(() => {
		return AVAILABLE_AGENCIES.map(agency => ({
			label: agency.name,
			value: agency._id,
		}));
	}, []);

	//
	// D. Define actions
	const toggleLock = () => {
		form.setFieldValue('is_locked', !form.getValues().is_locked);
	};

	//
	// E. Define context value
	const contextValue: PlanDetailContextState = useMemo(() => {
		return {
			actions: {
				createPlan: () => {
					console.log('createPlan');
				},
				toggleLock,
			},
			data: {
				agencies: availableAgencies,
				form,
				id: planId === PlanDetailMode.NEW ? undefined : planId,
			},
			flags: {
				canSave: false,
				isReadOnly: false,
				isSaving: false,
				loading: isLoading,
				mode: planId === PlanDetailMode.NEW ? PlanDetailMode.NEW : PlanDetailMode.EDIT,
			},
		};
	}, [availableAgencies, form, isLoading, planId]);

	// F. Render Components
	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);
};

'use client';

/* * */

import { Routes } from '@/lib/routes';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { CreatePlanDto, CreatePlanSchema, Plan, PlanSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { multipartFetch, swrFetcher } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum PlanDetailMode {
	EDIT = 'edit',
	NEW = 'new',
}

interface PlanDetailContextState {
	actions: {
		savePlan: () => void
		setOperationPlanFile: (file: File) => void
		setReferencePlanFile: (file: File) => void
		toggleLock: () => void
	}
	data: {
		agencies: { label: string, value: string }[]
		form: UseFormReturnType<CreatePlanDto>
		id: string | undefined
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
	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [operationPlanFile, setOperationPlanFile] = useState<File | null>(null);
	const [referencePlanFile, setReferencePlanFile] = useState<File | null>(null);

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

	// Validate form on change
	useEffect(() => {
		form.validate();
		console.log('canSave', form.isValid());
		setCanSave(form.isValid());

		console.log(form.errors);
	}, [form.values]);

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

	const createPlan = async () => {
		setIsSaving(true);
		const uploadFormData = new FormData();

		uploadFormData.append('agency_id', form.getValues().agency_id);
		uploadFormData.append('feeder_status', form.getValues().feeder_status);
		uploadFormData.append('is_approved', form.getValues().is_approved.toString());
		uploadFormData.append('is_locked', form.getValues().is_locked.toString());
		uploadFormData.append('valid_from', form.getValues().valid_from);
		uploadFormData.append('valid_until', form.getValues().valid_until);
		uploadFormData.append('operation_plan', operationPlanFile);

		const response = await multipartFetch(Routes.API(Routes.PLAN_LIST), uploadFormData);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao criar plano',
			});
			return;
		}

		const { data: { insertedId } } = response.data as { data: { insertedId: string } };

		if (insertedId) {
			router.push(Routes.PLAN_DETAIL(insertedId));
		}

		useToast.success({
			message: 'Plano criado com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
	};

	const updatePlan = () => {
		const formData = form.values;
		console.log('updatePlan', formData);
	};

	const savePlan = () => {
		if (planId === PlanDetailMode.NEW) {
			createPlan();
		}
		else {
			updatePlan();
		}
	};

	//
	// E. Define context value
	const contextValue: PlanDetailContextState = useMemo(() => {
		return {
			actions: {
				savePlan,
				setOperationPlanFile,
				setReferencePlanFile,
				toggleLock,
			},
			data: {
				agencies: availableAgencies,
				form,
				id: planId === PlanDetailMode.NEW ? undefined : planId,
			},
			flags: {
				canSave,
				isReadOnly: false,
				isSaving,
				loading: isLoading,
				mode: planId === PlanDetailMode.NEW ? PlanDetailMode.NEW : PlanDetailMode.EDIT,
			},
		};
	}, [availableAgencies, form, isLoading, isSaving, planId, canSave]);

	// F. Render Components
	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);
};

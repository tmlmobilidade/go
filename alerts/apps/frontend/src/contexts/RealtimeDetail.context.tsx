'use client';

/* * */

import { RealtimeStepCause } from '@/components/realtime/detail/RealtimeStepCause';
import { RealtimeStepTripDetails } from '@/components/realtime/detail/RealtimeStepTripDetails';
import { Step, useMultiStepForm, UseMultiStepFormState } from '@/hooks/use-multistep-form';
import { Routes } from '@/lib/routes';
import { Alert, causeSchema, CreateAlertDto, CreateAlertSchema, effectSchema, referenceTypeSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { Dates, fetchData } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';

/* * */

type RealtimeDetailContextState = UseMultiStepFormState & {
	actions: {
		saveAlert: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
	}
	flags: {
		isSaving: boolean
	}
};

const RealtimeDetailContext = createContext<RealtimeDetailContextState | undefined>(undefined);

export function useRealtimeDetailContext() {
	const context = useContext(RealtimeDetailContext);
	if (!context) {
		throw new Error('useRealtimeDetailContext must be used within a RealtimeDetailContextProvider');
	}
	return context;
}

/* * */

const STEPS: Step[] = [
	{
		component: RealtimeStepCause,
		id: 'cause',
	},
	{
		component: RealtimeStepTripDetails,
		id: 'trip-details',
	},
];

const emptyAlert: CreateAlertDto = {
	active_period_end_date: Dates.now('Europe/Lisbon').plus({ days: 1 }).unix_timestamp,
	active_period_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	cause: Object.values(causeSchema.Enum)[0],
	created_by: 'temp',
	description: '',
	effect: Object.values(effectSchema.Enum)[0],
	modified_by: 'temp',
	municipality_ids: [],
	publish_end_date: Dates.now('Europe/Lisbon').plus({ days: 1 }).unix_timestamp,
	publish_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	publish_status: 'PUBLISHED',
	reference_type: Object.values(referenceTypeSchema.Enum)[0],
	references: [],
	title: '',
	type: 'REALTIME',
};

/* * */

export const RealtimeDetailContextProvider = ({ children }: { children: React.ReactNode }) => {
	//
	// A. Setup variables

	const multiStepForm = useMultiStepForm({ steps: STEPS });
	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: emptyAlert,
		// @ts-ignore - zod conflict with zod-openapi from @carrismetropolitana/api-types
		validate: zodResolver(CreateAlertSchema) as FormValidateInput<CreateAlertDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	async function saveAlert() {
		setIsSaving(true);

		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			useToast.error({ message: 'Por favor, preencha todos os campos obrigatórios', title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });
		setIsSaving(false);

		// // Handle Save Alert
		// const saveAlert: CreateAlertDto = { ...form.values };
		// const url = Routes.ALERTS_API + Routes.ALERT_LIST;
		// const body = saveAlert;

		// const response = await fetchData<Alert>(url, 'POST', body);

		// if (!response.isOk) {
		// 	useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
		// 	setIsSaving(false);
		// 	return;
		// }

		// useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });
		// setIsSaving(false);
	};

	//
	// D. Define State

	const contextValue: RealtimeDetailContextState = useMemo(() => ({
		actions: {
			saveAlert,
			...multiStepForm.actions,
		},
		data: {
			form,
			...multiStepForm.data,
		},
		flags: {
			isSaving,
			...multiStepForm.flags,
		},
	}), [form, multiStepForm]);

	//
	// C. Return state
	return (
		<RealtimeDetailContext.Provider value={contextValue}>
			{children}
		</RealtimeDetailContext.Provider>
	);
};

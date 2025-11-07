'use client';

/* * */

import { RealtimeStepCause } from '@/components/realtime/create/RealtimeStepCause';
import { RealtimeStepEffect } from '@/components/realtime/create/RealtimeStepEffect';
import { RealtimeStepSummary } from '@/components/realtime/create/RealtimeStepSummary';
import { RealtimeStepTrips } from '@/components/realtime/create/RealtimeStepTrips';

/* * */

import { Step, useMultiStepForm, UseMultiStepFormState } from '@/hooks/use-multistep-form';
import { Dates } from '@tmlmobilidade/dates';
import { Alert, CreateAlertDto, CreateAlertSchema, gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import { mutate } from 'swr';

import { RidesData } from './Rides.context';
import { API_ROUTES } from '@tmlmobilidade/consts';

/* * */

type RealtimeCreateContextState = UseMultiStepFormState & {
	actions: {
		addAllTrips: (trips: RidesData[]) => void
		removeAllRides: () => void
		saveAlert: () => Promise<void>
		toggleTripReference: (trip: RidesData) => void
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
		selectedRides: RidesData[]
		steps: Step[]
	}
	flags: {
		isSaving: boolean
	}
};

const RealtimeCreateContext = createContext<RealtimeCreateContextState | undefined>(undefined);

export function useRealtimeCreateContext() {
	const context = useContext(RealtimeCreateContext);
	if (!context) {
		throw new Error('useRealtimeCreateContext must be used within a RealtimeCreateContextProvider');
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
		component: RealtimeStepEffect,
		id: 'effect',
	},
	{
		component: RealtimeStepTrips,
		id: 'trip',
	},
	{
		component: RealtimeStepSummary,
		id: 'summary',
	},
];

const emptyAlert: CreateAlertDto = {
	active_period_end_date: Dates.now('Europe/Lisbon').plus({ hours: Dates.STANDARD_WINDOW_HOURS }).unix_timestamp,
	active_period_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	cause: Object.values(gtfsCauseSchema)[0],
	created_by: 'temp',
	description: '',
	effect: Object.values(gtfsEffectSchema)[0],
	modified_by: 'temp',
	municipality_ids: [],
	publish_end_date: Dates.now('Europe/Lisbon').plus({ hours: Dates.STANDARD_WINDOW_HOURS }).unix_timestamp,
	publish_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	publish_status: 'PUBLISHED',
	reference_type: 'TRIP',
	references: [],
	title: '',
	type: 'REALTIME',
};

/* * */

export const RealtimeCreateContextProvider = ({ children }: { children: React.ReactNode }) => {
	//
	// A. Setup variables

	const multiStepForm = useMultiStepForm({ steps: STEPS });
	const [isSaving, setIsSaving] = useState(false);
	const [selectedRides, setSelectedRides] = useState<RidesData[]>([]);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: emptyAlert,
		validate: zodResolver(CreateAlertSchema) as FormValidateInput<CreateAlertDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const addAllTrips = (trips: RidesData[]) => {
		const newRides = trips.filter(trip => !selectedRides.some(ride => ride._id === trip._id));
		if (newRides.length > 0) {
			setSelectedRides(prevRides => [...prevRides, ...newRides]);
			form.setFieldValue('references', [
				...form.values.references,
				...newRides.map(trip => ({ child_ids: [], parent_id: trip._id })),
			]);
		}
	};

	const toggleTripReference = (trip: RidesData) => {
		if (form.values.references.some(reference => reference.parent_id === trip._id)) {
			form.setFieldValue('references', form.values.references.filter(reference => reference.parent_id !== trip._id));
			setSelectedRides(selectedRides.filter(ride => ride._id !== trip._id));
		}
		else {
			form.setFieldValue('references', [...form.values.references, { child_ids: [], parent_id: trip._id }]);
			setSelectedRides([...selectedRides, trip]);
		}
		form.values.references.push({ child_ids: [], parent_id: trip._id });
	};

	const removeAllRides = () => {
		setSelectedRides([]);
		form.setFieldValue('references', []);
	};

	async function reset() {
		form.reset();
		form.resetDirty();
		form.setFieldValue('references', []);
		multiStepForm.actions.goToStep(0);
		setSelectedRides([]);
	}

	async function saveAlert() {
		setIsSaving(true);

		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			useToast.error({ message: 'Por favor, preencha todos os campos obrigatórios', title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		// Handle Save Alert
		const saveAlert: CreateAlertDto = { ...form.values, publish_status: 'PUBLISHED' };
		const url = `${API_ROUTES.alerts.ALERTS_LIST}?realtime=true`;
		const body = saveAlert;
		const response = await fetchData<Alert>(url, 'POST', body);

		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		mutate('/api/alerts?realtime=true');
		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });

		reset();
		setIsSaving(false);
	};

	//
	// D. Define State

	const contextValue: RealtimeCreateContextState = useMemo(() => ({
		actions: {
			addAllTrips,
			removeAllRides,
			saveAlert,
			toggleTripReference,
			...multiStepForm.actions,
		},
		data: {
			form,
			selectedRides,
			...multiStepForm.data,
			steps: STEPS,
		},
		flags: {
			isSaving,
			...multiStepForm.flags,
		},
	}), [form, multiStepForm]);

	//
	// C. Return state
	return (
		<RealtimeCreateContext.Provider value={contextValue}>
			{children}
		</RealtimeCreateContext.Provider>
	);
};

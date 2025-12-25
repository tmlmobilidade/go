'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Alert, AlertSchema, CreateAlertDto, File as FileType, gtfsCauseSchema, gtfsEffectSchema, ReferenceTypeSchema, UpdateAlertSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { RidesData } from '../../../../../../packages/ui/src/hooks/use-data-rides';

/* * */

interface RealtimeDetailContextState {
	actions: {
		deleteAlert: () => void
		saveAlert: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
		id: string | undefined
		imageUrl?: FileType
		selectedRides: RidesData[]
	}
	flags: {
		canSave: boolean
		isDraft: boolean
		isSaving: boolean
		loading: boolean
	}
}

/* * */

const RealtimeDetailContext = createContext<RealtimeDetailContextState | undefined>(undefined);

export function useRealtimeDetailContext() {
	const context = useContext(RealtimeDetailContext);
	if (!context) {
		throw new Error('RealtimeDetailContext must be used within a RealtimeDetailContextProvider');
	}
	return context;
}

/* * */

const emptyAlert: CreateAlertDto = {
	active_period_end_date: undefined,
	active_period_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	cause: Object.values(gtfsCauseSchema.enum)[0],
	coordinates: null,
	description: '',
	effect: Object.values(gtfsEffectSchema.enum)[0],
	external_id: null,
	file_id: null,
	info_url: null,
	is_locked: false,
	municipality_ids: [],
	publish_end_date: undefined,
	publish_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	publish_status: 'DRAFT',
	reference_type: ReferenceTypeSchema.options[0],
	references: [],
	title: '',
	type: 'REALTIME',
};

export const RealtimeDetailContextProvider = ({ alertId, children }: { alertId: string, children: React.ReactNode }) => {
	//
	// A. Setup variables

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDraft, setIsDraft] = useState(false);
	const [canSave, setCanSave] = useState(false);

	const { data: alert, error, isLoading, mutate: alertMutate } = useSWR<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId) + '?realtime=true');
	const { data: alertImage, isLoading: alertImageLoading } = useSWR<FileType | undefined>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId) + '?realtime=true');
	const [selectedRides, setSelectedRides] = useState<RidesData[]>([]);

	useEffect(() => {
		const fetchSelectedRides = async () => {
			if (!alert?.references) return;

			const response = await fetchData<RidesData[]>(`${API_ROUTES.alerts.RIDES_SELECTED}?ids=${alert?.references.map(reference => reference.parent_id).join(',')}`);
			setSelectedRides(response.data ?? []);
		};

		fetchSelectedRides();
	}, [alert?.references]);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: emptyAlert,
		validate: zodResolver(AlertSchema) as FormValidateInput<CreateAlertDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	// Update form
	useEffect(() => {
		if (!alert) return;

		let myAlert: CreateAlertDto = alert;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, created_at, updated_at, ...rest } = alert;
		myAlert = { ...rest, publish_status: 'DRAFT' };

		setLoading(true);

		if (!myAlert.reference_type) {
			myAlert.reference_type = ReferenceTypeSchema.options[0];
			myAlert.references = [];
		}

		setIsDraft(myAlert.publish_status === 'DRAFT');
		form.reset();
		form.setValues(myAlert);
		form.resetDirty();

		setLoading(false);
	}, [alert]);

	// Handle error
	useEffect(() => {
		if (!error) return;

		useToast.error({ message: error.message, title: 'Erro ao carregar alerta' });
		router.replace(PAGE_ROUTES.alerts.REALTIME_LIST);
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Define actions
	const saveAlert = async () => {
		setIsSaving(true);

		// Handle Save Alert
		const saveAlert: CreateAlertDto = { ...form.values, publish_status: 'PUBLISHED' };

		const method = 'PUT';
		const url = `${API_ROUTES.alerts.ALERTS_DETAIL(alertId)}?realtime=true`;
		const body = convertObject(saveAlert, UpdateAlertSchema);

		const response = await fetchData<Alert>(url, method, body);

		if (!response.isOk) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });
		alertMutate();

		setIsSaving(false);
	};

	const deleteAlert = async () => {
		const response = await fetchData<Alert>(`${API_ROUTES.alerts.ALERTS_DETAIL(alertId)}?realtime=true`, 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao salvar alerta' });
			}
			return;
		}

		useToast.success({ message: 'Alerta apagado com sucesso', title: 'Sucesso' });
		alertMutate();
		router.replace(PAGE_ROUTES.alerts.REALTIME_LIST);

		setIsSaving(false);
	};

	//
	// E. Define context value
	const contextValue: RealtimeDetailContextState = useMemo(() => ({
		actions: {
			deleteAlert,
			saveAlert: () => saveAlert(),
		},
		data: {
			form,
			id: alertId,
			imageUrl: alertImage,
			selectedRides,
		},
		flags: {
			canSave,
			isDraft,
			isSaving,
			loading: isLoading || loading || alertImageLoading,
		},
	}), [alert, alertImage, alertId, canSave, form, isDraft, isSaving, loading, selectedRides, alertImageLoading]);

	//
	// F. Render components
	return (
		<RealtimeDetailContext.Provider value={contextValue}>
			{children}
		</RealtimeDetailContext.Provider>
	);
};

'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Alert, AlertSchema, AlertTypeSchema, CreateAlertDto, CreateAlertSchema, File as FileType, gtfsCauseSchema, gtfsEffectSchema, ReferenceTypeSchema, UpdateAlertSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export enum AlertDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface AlertDetailContextState {
	actions: {
		deleteAlert: () => void
		deleteImage: () => void
		fileChanged: (file: File) => void
		saveAlert: (type: 'draft' | 'publish') => void
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
		id: string | undefined
		imageUrl?: FileType
	}
	flags: {
		canSave: boolean
		isDraft: boolean
		isSaving: boolean
		loading: boolean
		mode: AlertDetailMode
	}
}

const emptyAlert: CreateAlertDto = {
	active_period_end_date: undefined,
	active_period_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	cause: Object.values(gtfsCauseSchema.enum)[0],
	coordinates: [0, 0],
	created_by: 'temp',
	description: '',
	effect: Object.values(gtfsEffectSchema.enum)[0],
	external_id: '',
	file_id: '',
	info_url: '',
	municipality_ids: [],
	publish_end_date: undefined,
	publish_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	publish_status: 'DRAFT',
	reference_type: ReferenceTypeSchema.options[0],
	references: [],
	title: '',
	type: AlertTypeSchema.options[0],
};

const AlertDetailContext = createContext<AlertDetailContextState | undefined>(undefined);

export function useAlertDetailContext() {
	const context = useContext(AlertDetailContext);
	if (!context) {
		throw new Error('useAlertDetailContext must be used within a AlertDetailContextProvider');
	}
	return context;
}

export const AlertDetailContextProvider = ({ alertId, children }: { alertId: string, children: React.ReactNode }) => {
	//
	// A. Setup variables
	const MODE = alertId === 'new' ? AlertDetailMode.CREATE : AlertDetailMode.EDIT;

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDraft, setIsDraft] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const copyURL = new URLSearchParams(window.location.search).get('copy');

	const { data: alert, error, isLoading } = useSWR<Alert>(MODE === AlertDetailMode.CREATE
		? copyURL ? API_ROUTES.alerts.ALERTS_DETAIL(copyURL) : null
		: API_ROUTES.alerts.ALERTS_DETAIL(alertId));

	const { data: alertImage, isLoading: alertImageLoading } = useSWR<FileType | undefined>(
		MODE === AlertDetailMode.CREATE
			? undefined
			: API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId),
	);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: emptyAlert,
		validate: zodResolver(alert && MODE === AlertDetailMode.EDIT ? AlertSchema : CreateAlertSchema) as FormValidateInput<CreateAlertDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	// Update form
	useEffect(() => {
		if (!alert) return;

		let myAlert: CreateAlertDto = alert;

		if (copyURL) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { _id, created_at, updated_at, ...rest } = alert;
			myAlert = { ...rest, publish_status: 'DRAFT' };
		}

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
		router.replace('/');
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Define actions
	const saveAlert = async (type: 'draft' | 'publish') => {
		setIsSaving(true);
		const saveAlert: CreateAlertDto = { ...form.values, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };
		const method = MODE === AlertDetailMode.CREATE ? 'POST' : 'PUT';
		const url = MODE === AlertDetailMode.CREATE ? API_ROUTES.alerts.ALERTS_LIST : API_ROUTES.alerts.ALERTS_DETAIL(alertId);
		const body = MODE === AlertDetailMode.CREATE ? saveAlert : convertObject(saveAlert, UpdateAlertSchema);
		const response = await fetchData<Alert>(url, method, body);

		if (!response.isOk) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		if (response.data) await uploadImage(response.data._id.toString());

		if (response.data && MODE === AlertDetailMode.CREATE) {
			router.replace(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(response.data._id.toString()));
		}
		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });

		setIsSaving(false);
	};

	const deleteAlert = async () => {
		if (MODE === AlertDetailMode.CREATE) return;

		const response = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao salvar alerta' });
			}
			return;
		}

		useToast.success({ message: 'Alerta apagado com sucesso', title: 'Sucesso' });

		router.replace(PAGE_ROUTES.alerts.SCHEDULED_LIST);
	};

	const deleteImage = async () => {
		if (MODE === AlertDetailMode.CREATE) return;

		const response = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao apagar imagem' });
			}
			return;
		}

		useToast.success({ message: 'Imagem apagada com sucesso', title: 'Sucesso' });
	};

	const uploadImage = async (alert_id: string) => {
		if (!image) return;
		const response = await uploadFile(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alert_id), image);
		if (response.error) {
			useToast.error({ message: response.error, title: 'Erro ao carregar imagem' });
			return;
		}
		useToast.success({ message: 'A imagem foi carregada com sucesso', title: 'Imagem carregada com sucesso' });
	};

	//
	// E. Define context value
	const contextValue: AlertDetailContextState = {
		actions: {
			deleteAlert,
			deleteImage,
			fileChanged: (file: File) => setImage(file),
			saveAlert: (type: 'draft' | 'publish') => saveAlert(type),
		},
		data: {
			form,
			id: MODE === AlertDetailMode.CREATE ? undefined : alertId,
			imageUrl: alertImage,
		},
		flags: {
			canSave,
			isDraft,
			isSaving,
			loading: isLoading || loading || alertImageLoading,
			mode: MODE,
		},
	};

	//
	// F. Render components
	return (
		<AlertDetailContext.Provider value={contextValue}>
			{children}
		</AlertDetailContext.Provider>
	);
};

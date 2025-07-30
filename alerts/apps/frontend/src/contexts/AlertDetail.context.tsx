'use client';

import { Routes } from '@/lib/routes';
import { Alert, AlertSchema, causeSchema, CreateAlertDto, CreateAlertSchema, effectSchema, File as FileType, referenceTypeSchema, UpdateAlertSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData, swrFetcher, uploadFile } from '@tmlmobilidade/utils';
import { convertObject, Dates } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export enum AlertDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface AlertDetailContextState {
	actions: {
		addReference: () => void
		deleteAlert: () => void
		deleteImage: () => void
		fileChanged: (file: File) => void
		removeReference: (index: number) => void
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
	cause: Object.values(causeSchema.Enum)[0],
	created_by: 'temp',
	description: '',
	effect: Object.values(effectSchema.Enum)[0],
	modified_by: 'temp',
	municipality_ids: [],
	publish_end_date: undefined,
	publish_start_date: Dates.now('Europe/Lisbon').unix_timestamp,
	publish_status: 'DRAFT',
	reference_type: Object.values(referenceTypeSchema.Enum)[0],
	references: [],
	title: '',
	type: 'PLANNED',
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
		? copyURL ? Routes.ALERTS_API + Routes.ALERT_DETAIL(copyURL) : null
		: Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId), swrFetcher);

	const { data: alertImage, isLoading: alertImageLoading } = useSWR<FileType | undefined>(
		MODE === AlertDetailMode.CREATE
			? undefined
			: Routes.ALERTS_API + Routes.ALERT_IMAGE(alertId),
		swrFetcher,
	);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: emptyAlert,
		// @ts-ignore - zod conflict with zod-openapi from @carrismetropolitana/api-types
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
			myAlert.reference_type = Object.values(referenceTypeSchema.Enum)[0];
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
		router.replace(Routes.ALERT_LIST);
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Define actions
	const addReference = () => {
		const currentReferences = form.values.references || [];
		currentReferences.push({ child_ids: [], parent_id: '' });
		form.setFieldValue('references', currentReferences);
	};

	const removeReference = (index: number) => {
		const currentReferences = form.values.references || [];
		form.setFieldValue('references', currentReferences.filter((_, i) => i !== index));
	};

	const saveAlert = async (type: 'draft' | 'publish') => {
		setIsSaving(true);

		// Handle Save Alert
		const saveAlert: CreateAlertDto = { ...form.values, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };

		const method = MODE === AlertDetailMode.CREATE ? 'POST' : 'PUT';
		const url = MODE === AlertDetailMode.CREATE ? Routes.ALERTS_API + Routes.ALERT_LIST : Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId);
		const body = MODE === AlertDetailMode.CREATE ? saveAlert : convertObject(saveAlert, UpdateAlertSchema);

		const response = await fetchData<Alert>(url, method, body);

		if (!response.isOk) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		// Upload image if the alert is new
		if (response.data) await uploadImage(response.data._id.toString());

		// Redirect to the detail page if the alert is new
		if (response.data && MODE === AlertDetailMode.CREATE) {
			router.replace(Routes.ALERT_DETAIL(response.data._id.toString()));
		}

		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });

		setIsSaving(false);
	};

	const deleteAlert = async () => {
		if (MODE === AlertDetailMode.CREATE) return;

		const response = await fetchData<Alert>(Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao salvar alerta' });
			}
			return;
		}

		useToast.success({ message: 'Alerta apagado com sucesso', title: 'Sucesso' });

		router.replace(Routes.ALERT_LIST);
	};

	const deleteImage = async () => {
		if (MODE === AlertDetailMode.CREATE) return;

		const response = await fetchData<Alert>(Routes.ALERTS_API + Routes.ALERT_IMAGE(alertId), 'DELETE', alert);
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
		if (MODE === AlertDetailMode.CREATE || !image) return;

		console.log('HERE =======> ', alert_id);
		const response = await uploadFile(Routes.ALERTS_API + Routes.ALERT_IMAGE(alert_id), image);

		console.log('HERE =======> ', response);

		if (response.error) {
			console.log('HERE =======> ', response.error);
			useToast.error({ message: response.error, title: 'Erro ao carregar imagem' });
			return;
		}

		console.log('SUCCESS =======> ', response.data);
		useToast.success({ message: 'A imagem foi carregada com sucesso', title: 'Imagem carregada com sucesso' });
	};

	//
	// E. Define context value
	const contextValue: AlertDetailContextState = {
		actions: {
			addReference,
			deleteAlert,
			deleteImage,
			fileChanged: (file: File) => setImage(file),
			removeReference,
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

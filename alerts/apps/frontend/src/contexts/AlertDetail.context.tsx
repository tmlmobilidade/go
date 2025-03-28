'use client';

import { fetchData, swrFetcher, uploadFile } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { Alert, AlertSchema, causeSchema, CreateAlertDto, CreateAlertSchema, effectSchema, referenceTypeSchema, UpdateAlertSchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject, getUnixTimestamp } from '@tmlmobilidade/utils';
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
		imageUrl: string | undefined
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: AlertDetailMode
	}
}

const emptyAlert: CreateAlertDto = {
	active_period_end_date: undefined,
	active_period_start_date: getUnixTimestamp(),
	cause: Object.values(causeSchema.Enum)[0],
	created_by: 'temp',
	description: '',
	effect: Object.values(effectSchema.Enum)[0],
	modified_by: 'temp',
	municipality_ids: [],
	publish_end_date: undefined,
	publish_start_date: getUnixTimestamp(),
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
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const { data: alert, error, isLoading } = useSWR<Alert>(alertId === 'new' ? null : Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId), swrFetcher);
	const { data: imageUrl, isLoading: imageUrlLoading } = useSWR<undefined | { data: string, message: string }>(
		alertId === 'new'
			? undefined
			: Routes.ALERTS_API + Routes.ALERT_IMAGE(alertId),
		swrFetcher,
	);

	//
	// B. Define form
	const form = useForm<CreateAlertDto>({
		initialValues: alert || emptyAlert,
		validate: zodResolver(alert ? AlertSchema : CreateAlertSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Transform Data

	// Update form
	useEffect(() => {
		if (!alert) return;

		setLoading(true);

		if (!alert.reference_type) {
			alert.reference_type = Object.values(referenceTypeSchema.Enum)[0];
			alert.references = [];
		}

		form.reset();
		form.setValues(alert);
		form.resetDirty();

		setLoading(false);
	}, [alert]);

	useEffect(() => {
		if (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao carregar alerta',
			});
			router.replace(Routes.ALERT_LIST);
		}
	}, [error]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());

		console.log(form.errors);
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
		const active_period_end_date = form.getValues().active_period_end_date ?? null;
		const publish_end_date = form.getValues().publish_end_date ?? null;

		const saveAlert: CreateAlertDto = { ...form.values, active_period_end_date, publish_end_date, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };

		const method = alertId === 'new' ? 'POST' : 'PUT';
		const url = alertId === 'new' ? Routes.ALERTS_API + Routes.ALERT_LIST : Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId);
		let body = alertId === 'new' ? saveAlert : convertObject(saveAlert, UpdateAlertSchema);

		body = { ...body, active_period_end_date, publish_end_date };

		const response = await fetchData<unknown>(url, method, body);

		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar alerta',
				});
			}

			return;
		}

		const insertedId = alertId === 'new' ? (response.data as { data: { insertedId: string } }).data.insertedId : alertId;
		if (insertedId) {
			await uploadImage(insertedId);
		}

		// If the alert is new, redirect to the detail page
		if (insertedId && alertId === 'new') {
			router.replace(Routes.ALERT_DETAIL(insertedId));
		}

		useToast.success({
			message: 'Alerta salvo com sucesso',
			title: 'Sucesso',
		});

		setIsSaving(false);
	};

	const deleteAlert = async () => {
		if (alertId === 'new') return;

		const response = await fetchData<Alert>(Routes.ALERTS_API + Routes.ALERT_DETAIL(alertId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar alerta',
				});
			}
			return;
		}

		useToast.success({
			message: 'Alerta apagado com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.ALERT_LIST);
	};

	const deleteImage = async () => {
		if (alertId === 'new') return;

		const response = await fetchData<Alert>(Routes.ALERTS_API + Routes.ALERT_IMAGE(alertId), 'DELETE', alert);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar imagem',
				});
			}
			return;
		}

		useToast.success({
			message: 'Imagem apagada com sucesso',
			title: 'Sucesso',
		});
	};

	const uploadImage = async (alert_id: string) => {
		if (alert_id === 'new' || !image) return;

		const response = await uploadFile(
			Routes.ALERTS_API + Routes.ALERT_IMAGE(alert_id),
			image,
		);

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao carregar imagem',
			});
			return;
		}

		useToast.success({
			message: 'A imagem foi carregada com sucesso',
			title: 'Imagem carregada com sucesso',
		});
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
			id: alertId === 'new' ? undefined : alertId,
			imageUrl: imageUrl?.data,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading || imageUrlLoading,
			mode: alertId === 'new' ? AlertDetailMode.CREATE : AlertDetailMode.EDIT,
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

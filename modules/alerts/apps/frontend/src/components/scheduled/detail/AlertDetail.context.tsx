'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert, AlertSchema, File as FileType, UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { convertObject, fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

interface AlertDetailContextState {
	actions: {
		deleteAlert: () => void
		deleteImage: () => void
		fileChanged: (file: File) => void
		saveAlert: (type: 'draft' | 'publish') => void
	}
	data: {
		form: UseFormReturnType<UpdateAlertDto>
		id: string | undefined
		imageUrl?: FileType
	}
	flags: {
		isSaving: boolean
		loading: boolean
	}
}

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
	const [isSaving, setIsSaving] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const copyURL = new URLSearchParams(window.location.search).get('copy');

	//
	// B. Fetch Data
	const { mutate: allAlertsMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);
	const { data: alertData, isLoading: alertLoading, mutate: alertMutate } = useSWR<Alert>(copyURL ? API_ROUTES.alerts.ALERTS_DETAIL(copyURL) : API_ROUTES.alerts.ALERTS_DETAIL(alertId));

	const { data: alertImage, isLoading: alertImageLoading } = useSWR<FileType | undefined>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId));

	//
	// C. Define form

	const { form } = useTypicalForm<UpdateAlertDto>(AlertSchema, alertData);

	//
	// D. Define actions
	const saveAlert = async (type: 'draft' | 'publish') => {
		setIsSaving(true);
		const saveAlert: UpdateAlertDto = { ...form.values, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };
		const body = convertObject(saveAlert, UpdateAlertSchema);
		const response = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'PUT', body);

		if (!response.isOk) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		if (response.data) await uploadImage(response.data._id.toString());

		if (response.data?._id) {
			router.replace(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(response.data._id.toString()));
		}

		form.resetDirty();
		alertMutate();
		allAlertsMutate();
		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });

		setIsSaving(false);
	};

	const deleteAlert = async () => {
		if (!alertId) return;

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
		if (!alertId) return;

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
	const contextValue: AlertDetailContextState = useMemo(() => ({
		actions: {
			deleteAlert,
			deleteImage,
			fileChanged: (file: File) => setImage(file),
			saveAlert: (type: 'draft' | 'publish') => saveAlert(type),
		},
		data: {
			form,
			id: alertId,
			imageUrl: alertImage,
		},
		flags: {
			isSaving,
			loading: alertImageLoading || alertLoading,
		},
	}), [
		form,
		alertLoading,
		alertImageLoading,
		isSaving,
		alertId,
	]);

	//
	// F. Render components
	return (
		<AlertDetailContext.Provider value={contextValue}>
			{children}
		</AlertDetailContext.Provider>
	);
};

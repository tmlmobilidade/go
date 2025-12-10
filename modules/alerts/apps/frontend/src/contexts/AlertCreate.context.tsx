'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert, CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AlertCreateContextState {
	actions: {
		saveAlert: (type: 'draft' | 'publish') => void
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
	}
	flags: {
		isSaving: boolean
	}
	modal: {
		close: () => void
		open: () => void
		state: boolean
	}
}

/* * */

const AlertCreateContext = createContext<AlertCreateContextState | undefined>(undefined);

export function useAlertCreateContext() {
	const context = useContext(AlertCreateContext);
	if (!context) {
		throw new Error('useAlertCreateContext must be used within a AlertCreateContextProvider');
	}
	return context;
}

/* * */

export const AlertCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [modalState, setModalState] = useState(false);

	//
	// B. Fetch data

	const { mutate: allAlertsMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	//
	// D. Handle actions

	const handleSaveAlert = async (type: 'draft' | 'publish') => {
		setIsSaving(true);

		const saveAlert: CreateAlertDto = { ...form.values, publish_status: type === 'publish' ? 'PUBLISHED' : 'DRAFT' };
		const body = saveAlert;

		const response = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', body);

		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao salvar Alerta' });
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao salvar Alerta' });
				}
			}
			setIsSaving(false);
			return;
		}

		form.resetDirty();
		console.log('response', response);
		useToast.success({ message: 'Alerta criado com sucesso', title: 'Sucesso' });

		if (response.data?._id) {
			router.replace(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(response.data._id));
		}

		allAlertsMutate();
		setIsSaving(false);
		setModalState(false);
	};

	//
	// E. Define context value

	const contextValue: AlertCreateContextState = useMemo(() => ({
		actions: {
			saveAlert: handleSaveAlert,
		},
		data: {
			form,
		},
		flags: {
			isSaving,
		},
		modal: {
			close: () => setModalState(false),
			open: () => setModalState(true),
			state: modalState,
		},
	}), [
		form,
		modalState,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
};

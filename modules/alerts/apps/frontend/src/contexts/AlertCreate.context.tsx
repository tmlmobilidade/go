'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Alert, CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
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
		isReadOnly: boolean
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
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
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
		const url = API_ROUTES.alerts.ALERTS_LIST;
		const body = saveAlert;
		const response = await fetchData<Alert>(url, 'POST', body);

		if (!response.isOk) {
			useToast.error({ message: response.error, title: 'Erro ao salvar alerta' });
			setIsSaving(false);
			return;
		}

		useToast.success({ message: 'Alerta salvo com sucesso', title: 'Sucesso' });
		allAlertsMutate();
		setIsSaving(false);
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
			isReadOnly,
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
		isReadOnly,
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

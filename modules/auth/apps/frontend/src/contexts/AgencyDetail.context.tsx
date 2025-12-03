'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Agency, UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AgencyDetailContextState {
	actions: {
		saveAgency: () => void
	}
	data: {
		agency: Agency | null
		form: UseFormReturnType<UpdateAgencyDto>
		id: string
	}
	flags: {
		error: Error | null
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

/* * */

const AgencyDetailContext = createContext<AgencyDetailContextState | undefined>(undefined);

export function useAgencyDetailContext() {
	const context = useContext(AgencyDetailContext);
	if (!context) {
		throw new Error('useAgencyDetailContext must be used within a AgencyDetailContextProvider');
	}
	return context;
}

/* * */

export const AgencyDetailContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId: string }>) => {
	//

	//
	// A. Setup variables

	const [isReady, setIsReady] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { data: agencyData, error: agencyError, isLoading: agencyLoading, mutate: agencyMutate } = useSWR<Agency>(API_ROUTES.auth.AGENCIES_DETAIL(agencyId));

	//
	// C. Setup form

	const form = useForm<UpdateAgencyDto>({
		mode: 'uncontrolled',
		validate: zodResolver(UpdateAgencySchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!agencyData) return;
		const initialValues = UpdateAgencySchema.parse(agencyData);
		form.initialize(initialValues);
		setIsReady(true);
	}, [agencyData]);

	//
	// E. Handle actions

	const handleSaveAgency = async () => {
		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar operador',
		});
		try {
			const response = await fetchData<Agency>(API_ROUTES.auth.AGENCIES_DETAIL(agencyId), 'PUT', form.getValues());
			if (response.error) {
				return useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao guardar alterações',
					type: 'error',
				});
			}
			useToast.update(toastId, {
				loading: false,
				message: 'As alterações serão refletidas em breve.',
				title: 'Operador guardado com sucesso',
				type: 'success',
			});
			form.resetDirty();
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao guardar alterações',
				type: 'error',
			});
		}
		finally {
			agencyMutate();
			setIsSaving(false);
		}
	};

	//
	// F. Define context value

	const contextValue: AgencyDetailContextState = useMemo(() => ({
		actions: {
			saveAgency: handleSaveAgency,
		},
		data: {
			agency: agencyData,
			form,
			id: agencyId,
		},
		flags: {
			error: agencyError,
			loading: agencyLoading || !isReady,
			read_only: agencyLoading || isSaving,
			saving: isSaving,
		},
	}), [
		agencyData,
		agencyError,
		agencyLoading,
		form,
		agencyId,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<AgencyDetailContext.Provider value={contextValue}>
			{children}
		</AgencyDetailContext.Provider>
	);

	//
};

'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Period, type UpdatePeriodDto } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodsDetailContextState {
	actions: {
		deletePeriod: () => void
		savePeriod: () => void
		toggleLock: () => void
	}
	data: {
		form: UseFormReturnType<UpdatePeriodDto>
		id: string
		period: null | Period
	}
	flags: {
		error: Error | null
		loading: boolean
		read_only: boolean
		saving: boolean
	}
}

/* * */

const PeriodsDetailContext = createContext<PeriodsDetailContextState | undefined>(undefined);

export function usePeriodsDetailContext() {
	const context = useContext(PeriodsDetailContext);
	if (!context) {
		throw new Error('usePeriodsDetailContext must be used within a PeriodsDetailContextProvider');
	}
	return context;
}

/* * */

export const PeriodsDetailContextProvider = ({ children, periodId }: PropsWithChildren<{ periodId: string }>) => {
	//

	//
	// A. Setup variables

	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: periodsListMutate } = useSWR<Period[]>(API_ROUTES.dates.PERIODS_LIST);
	const { data: periodData, error: periodError, isLoading: periodLoading, mutate: periodMutate } = useSWR<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId), { refreshInterval: 5000 });

	//
	// C. Setup form

	const form = useForm<UpdatePeriodDto>({
		initialValues: {
			agency_id: '',
			color: '',
			dates: [],
			name: '',
			updated_by: '',
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// D. Transform data

	useEffect(() => {
		if (!periodData) return;
		form.initialize({
			agency_id: periodData.agency_id,
			color: periodData.color,
			dates: periodData.dates || [],
			name: periodData.name,
			updated_by: periodData.updated_by,
		});
	}, [periodData]);

	useEffect(() => {
		if (!periodError) return;
		useToast.error({ message: periodError.message, title: 'Erro ao abrir período' });
	}, [periodLoading]);

	//
	// E. Handle actions

	const handleSavePeriod = async () => {
		setIsSaving(true);
		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A guardar período',
		});
		try {
			const response = await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId), 'PUT', form.getValues());
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
				message: 'As alterações foram guardadas.',
				title: 'Período guardado com sucesso',
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
			periodMutate();
			periodsListMutate();
			setIsSaving(false);
		}
	};

	const handleDeletePeriod = async () => {
		try {
			const response = await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId), 'DELETE', periodData);
			if (response.error) {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao apagar período' });
				}
				return;
			}

			useToast.success({ message: 'Período apagado com sucesso', title: 'Sucesso' });

			router.replace(PAGE_ROUTES.dates.PERIODS_LIST);
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao apagar período',
			});
		}
		finally {
			periodsListMutate();
		}
	};

	const handleToggleLock = async () => {
		try {
			const response = await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL_TOGGLE_LOCK(periodId));
			if (response.error) {
				return useToast.error({
					message: response.error,
					title: 'Erro ao bloquear período',
				});
			}
		}
		catch (error) {
			useToast.error({
				message: error.message,
				title: 'Erro ao bloquear período',
			});
		}
		finally {
			periodMutate();
			periodsListMutate();
		}
	};

	//
	// F. Define context value

	const contextValue: PeriodsDetailContextState = useMemo(() => ({
		actions: {
			deletePeriod: handleDeletePeriod,
			savePeriod: handleSavePeriod,
			toggleLock: handleToggleLock,
		},
		data: {
			form,
			id: periodId,
			period: periodData,
		},
		flags: {
			error: periodError,
			loading: periodLoading,
			read_only: periodData?.is_locked || periodLoading || isSaving,
			saving: isSaving,
		},
	}), [
		periodData,
		periodError,
		periodLoading,
		periodId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<PeriodsDetailContext.Provider value={contextValue}>
			{children}
		</PeriodsDetailContext.Provider>
	);

	//
};

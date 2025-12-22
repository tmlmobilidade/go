/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreatePeriodDto, CreatePeriodSchema, type Period } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface PeriodsCreateContextState {
	actions: {
		createPeriod: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreatePeriodDto>
	}
	flags: {
		loading: boolean
	}
}

/* * */

const PeriodsCreateContext = createContext<PeriodsCreateContextState | undefined>(undefined);

export function usePeriodsCreateContext() {
	const context = useContext(PeriodsCreateContext);
	if (!context) {
		throw new Error('usePeriodsCreateContext must be used within a PeriodsCreateContextProvider');
	}
	return context;
}

/* * */

export const PeriodsCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);

	//
	// B. Setup form

	const form = useForm<CreatePeriodDto>({
		initialValues: {
			agency_id: '',
			color: '',
			is_locked: false,
			name: '',
		},
		validate: zodResolver(CreatePeriodSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// C. Handle actions

	const createPeriod = async () => {
		setIsLoading(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A criar período',
		});

		try {
			const response = await fetchData<Period>(API_ROUTES.dates.PERIODS_LIST, 'POST', form.getValues());

			if (response.error) {
				useToast.update(toastId, {
					loading: false,
					message: response.error,
					title: 'Erro ao criar período',
					type: 'error',
				});
				setIsLoading(false);
				return;
			}

			useToast.update(toastId, {
				loading: false,
				message: 'Período criado com sucesso',
				title: 'Sucesso',
				type: 'success',
			});

			mutate(API_ROUTES.dates.PERIODS_LIST);

			setIsLoading(false);

			if (response.data) {
				window.location.href = PAGE_ROUTES.dates.PERIODS_DETAIL(response.data._id);
			}
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message,
				title: 'Erro ao criar período',
				type: 'error',
			});
			setIsLoading(false);
		}
	};

	//
	// D. Define context value

	const contextValue: PeriodsCreateContextState = useMemo(() => {
		return {
			actions: {
				createPeriod,
			},
			data: {
				form,
			},
			flags: {
				loading: isLoading,
			},
		};
	}, [form, isLoading]);

	//
	// E. Render components

	return (
		<PeriodsCreateContext.Provider value={contextValue}>
			{children}
		</PeriodsCreateContext.Provider>
	);

	//
};

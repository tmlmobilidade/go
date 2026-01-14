/* * */

import { closeCreatePeriodModal } from '@/components/periods/create/PeriodCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreatePeriodDto, CreatePeriodSchema, type Period } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodCreateContextState {
	actions: {
		createPeriod: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreatePeriodDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const PeriodCreateContext = createContext<PeriodCreateContextState | undefined>(undefined);

export function usePeriodCreateContext() {
	const context = useContext(PeriodCreateContext);
	if (!context) {
		throw new Error('usePeriodCreateContext must be used within a PeriodCreateContextProvider');
	}
	return context;
}

/* * */

export const PeriodCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allPeriodsMutate } = useSWR<Period[]>(API_ROUTES.dates.PERIODS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreatePeriodDto>(CreatePeriodSchema);

	//
	// D. Handle actions

	const handleCreatePeriod = async () => {
		setIsSaving(true);
		const response = await fetchData<Period>(API_ROUTES.dates.PERIODS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar período' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar período' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allPeriodsMutate();
		setIsSaving(false);
		closeCreatePeriodModal();
		useToast.success({ message: 'Período criado com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.dates.PERIODS_DETAIL(response.data._id)));
	};

	//
	// D. Define context value

	const contextValue: PeriodCreateContextState = useMemo(() => {
		return {
			actions: {
				createPeriod: handleCreatePeriod,
			},
			data: {
				form,
			},
			flags: {
				isSaving,
			},
		};
	}, [form, isSaving]);

	//
	// E. Render components

	return (
		<PeriodCreateContext.Provider value={contextValue}>
			{children}
		</PeriodCreateContext.Provider>
	);

	//
};

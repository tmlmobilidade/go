/* * */

import { closeCreateHolidayModal } from '@/components/holidays/create/HolidayCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface HolidayCreateContextState {
	actions: {
		createHoliday: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateHolidayDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const HolidayCreateContext = createContext<HolidayCreateContextState | undefined>(undefined);

export function useHolidayCreateContext() {
	const context = useContext(HolidayCreateContext);
	if (!context) {
		throw new Error('useHolidayCreateContext must be used within a HolidayCreateContextProvider');
	}
	return context;
}

/* * */

export const HolidayCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allHolidaysMutate } = useSWR<Holiday[]>(API_ROUTES.dates.HOLIDAYS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateHolidayDto>(CreateHolidaySchema);

	//
	// D. Handle actions

	const handleCreateHoliday = async () => {
		setIsSaving(true);
		const response = await fetchData<Holiday>(API_ROUTES.dates.HOLIDAYS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar Feriado' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar Feriado' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allHolidaysMutate();
		setIsSaving(false);
		closeCreateHolidayModal();
		useToast.success({ message: 'Feriado criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: HolidayCreateContextState = useMemo(() => {
		return {
			actions: {
				createHoliday: handleCreateHoliday,
			},
			data: {
				form,
			},
			flags: {
				isSaving,
			},
		};
	}, [
		form,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<HolidayCreateContext.Provider value={contextValue}>
			{children}
		</HolidayCreateContext.Provider>
	);

	//
};

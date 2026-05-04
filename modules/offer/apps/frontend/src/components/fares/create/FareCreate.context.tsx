/* * */

import { closeCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateFareDto, CreateFareSchema, Fare } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface FareCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateFareDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const FareCreateContext = createContext<FareCreateContextState | undefined>(undefined);

export function useFareCreateContext() {
	const context = useContext(FareCreateContext);
	if (!context) {
		throw new Error('useFareCreateContext must be used within a FareCreateContextProvider');
	}
	return context;
}

/* * */

export const FareCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: allFaresMutate } = useSWR<Fare[]>(API_ROUTES.offer.FARES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateFareDto>(CreateFareSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Fare>(API_ROUTES.offer.FARES_LIST, 'POST', form.getValues()),
		onSuccess: (createdItem) => {
			form.resetDirty();
			allFaresMutate();
			closeCreateFareModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_DETAIL(createdItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: FareCreateContextState = useMemo(() => {
		return {
			actions: {
				create: handleCreate,
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
		<FareCreateContext.Provider value={contextValue}>
			{children}
		</FareCreateContext.Provider>
	);

	//
};

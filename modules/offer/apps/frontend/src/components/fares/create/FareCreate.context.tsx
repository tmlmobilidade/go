/* * */

import { closeCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateFareDto, CreateFareSchema, type Fare } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type UseFormReturnType, useHandleAction, useTypicalForm } from '@tmlmobilidade/ui';
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

	const { action: handleCreate, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<Fare>({ body: form.getValues(), method: 'POST', url: API_ROUTES.offer.FARES_LIST }),
		onSuccess: ({ data }) => {
			form.resetDirty();
			allFaresMutate();
			closeCreateFareModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_DETAIL(data._id)));
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

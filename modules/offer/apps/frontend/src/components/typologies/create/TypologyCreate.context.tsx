/* * */

import { closeCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateTypologyDto, CreateTypologySchema, Typology } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type UseFormReturnType, useHandleAction, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface TypologyCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateTypologyDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const TypologyCreateContext = createContext<TypologyCreateContextState | undefined>(undefined);

export function useTypologyCreateContext() {
	const context = useContext(TypologyCreateContext);
	if (!context) {
		throw new Error('useTypologyCreateContext must be used within a TypologyCreateContextProvider');
	}
	return context;
}

/* * */

export const TypologyCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: allTypologiesMutate } = useSWR<Typology[]>(API_ROUTES.offer.TYPOLOGIES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateTypologyDto>(CreateTypologySchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<Typology>({ body: form.getValues(), method: 'POST', url: API_ROUTES.offer.TYPOLOGIES_LIST }),
		onSuccess: ({ data }) => {
			form.resetDirty();
			allTypologiesMutate();
			closeCreateTypologyModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_DETAIL(data._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: TypologyCreateContextState = useMemo(() => {
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
		<TypologyCreateContext.Provider value={contextValue}>
			{children}
		</TypologyCreateContext.Provider>
	);

	//
};

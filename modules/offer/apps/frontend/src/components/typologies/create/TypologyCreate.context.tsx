/* * */

import { closeCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateTypologyDto, CreateTypologySchema, Typology } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext } from 'react';
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

	const { formRef } = useTypicalForm<CreateTypologyDto>(CreateTypologySchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Typology>(API_ROUTES.offer.TYPOLOGIES_LIST, 'POST', formRef.current.getValues()),
		onSuccess: (createdItem) => {
			formRef.current.resetDirty();
			allTypologiesMutate();
			closeCreateTypologyModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_DETAIL(createdItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: TypologyCreateContextState = {
		actions: {
			create: handleCreate,
		},
		data: {
			form: formRef.current,
		},
		flags: {
			isSaving,
		},
	};

	//
	// F. Render components

	return (
		<TypologyCreateContext.Provider value={contextValue}>
			{children}
		</TypologyCreateContext.Provider>
	);

	//
};

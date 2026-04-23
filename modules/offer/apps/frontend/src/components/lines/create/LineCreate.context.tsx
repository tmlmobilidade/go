'use client';

/* * */

import { closeCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateLineDto, CreateLineSchema, Line } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface LineCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateLineDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const LineCreateContext = createContext<LineCreateContextState | undefined>(undefined);

export function useLineCreateContext() {
	const context = useContext(LineCreateContext);
	if (!context) {
		throw new Error('useLineCreateContext must be used within a LineCreateContextProvider');
	}
	return context;
}

/* * */

export const LineCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: linesListMutate } = useSWR<Line[]>(API_ROUTES.offer.LINES_LIST);

	//
	// C. Setup form

	const { formRef } = useTypicalForm<CreateLineDto>(CreateLineSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Line>(API_ROUTES.offer.LINES_LIST, 'POST', formRef.current.getValues()),
		onSuccess: (newItem) => {
			formRef.current.resetDirty();
			linesListMutate();
			closeCreateLineModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(newItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: LineCreateContextState = {
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
	// H. Render components

	return (
		<LineCreateContext.Provider value={contextValue}>
			{children}
		</LineCreateContext.Provider>
	);

	//
};

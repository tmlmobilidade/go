'use client';

/* * */

import { closeCreateRouteModal } from '@/components/routes/create/RouteCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateRouteDto, CreateRouteSchema, Line, Route } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RouteCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateRouteDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const RouteCreateContext = createContext<RouteCreateContextState | undefined>(undefined);

export function useRouteCreateContext() {
	const context = useContext(RouteCreateContext);
	if (!context) {
		throw new Error('useRouteCreateContext must be used within a RouteCreateContextProvider');
	}
	return context;
}

/* * */

export const RouteCreateContextProvider = ({ children, lineId }: PropsWithChildren<{ lineId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: lineMutate } = useSWR<Line>(API_ROUTES.offer.LINES_DETAIL(lineId));

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateRouteDto>(CreateRouteSchema, undefined, { line_id: lineId });

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Route>(API_ROUTES.offer.ROUTES_LIST, 'POST', form.getValues()),
		onSuccess: (newItem) => {
			form.resetDirty();
			lineMutate();
			closeCreateRouteModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.ROUTE_DETAIL(lineId, newItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: RouteCreateContextState = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		data: {
			form,
		},
		flags: {
			isSaving,
		},
	}), [
		form,
		isSaving,
	]);

	//
	// H. Render components

	return (
		<RouteCreateContext.Provider value={contextValue}>
			{children}
		</RouteCreateContext.Provider>
	);

	//
};

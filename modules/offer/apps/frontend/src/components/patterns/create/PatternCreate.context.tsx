'use client';

/* * */

import { closeCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreatePatternDto, CreatePatternSchema, Pattern, Route } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PatternCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreatePatternDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const PatternCreateContext = createContext<PatternCreateContextState | undefined>(undefined);

export function usePatternCreateContext() {
	const context = useContext(PatternCreateContext);
	if (!context) {
		throw new Error('usePatternCreateContext must be used within a PatternCreateContextProvider');
	}
	return context;
}

/* * */

export const PatternCreateContextProvider = ({ children, lineId, routeId }: PropsWithChildren<{ lineId: string, routeId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: routeMutate } = useSWR<Route>(API_ROUTES.offer.ROUTES_DETAIL(routeId));

	//
	// C. Setup form

	const { form } = useTypicalForm<CreatePatternDto>(CreatePatternSchema, undefined, { line_id: lineId, route_id: routeId });

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_LIST, 'POST', form.getValues()),
		onSuccess: (newItem) => {
			form.resetDirty();
			routeMutate();
			closeCreatePatternModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.PATTERN_DETAIL(lineId, newItem._id, routeId)));
		},
	});

	//
	// E. Define context value

	const contextValue: PatternCreateContextState = useMemo(() => ({
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
		<PatternCreateContext.Provider value={contextValue}>
			{children}
		</PatternCreateContext.Provider>
	);

	//
};

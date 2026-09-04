'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { StopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { Stop } from '@tmlmobilidade/go-types-infrastructure';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { closeStopsCreateModal } from './StopsCreate.modal';

/* * */

const StopsCreateFormContext = createContext<StandardFormContextValue<StopsCreateRequest> | undefined>(undefined);

export function useStopsCreateFormContext() {
	const context = useContext(StopsCreateFormContext);
	if (!context) throw new Error('useStopsCreateFormContext must be used within a StopsCreateFormContextProvider');
	return context;
}

/* * */

export function StopsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup form

	const router = useRouter();

	const formDefaultValues = useMemo<StopsCreateRequest>(() => ({
		latitude: undefined,
		longitude: undefined,
		name: '',
	}), []);

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsCreateRequest, typeof StopsCreateRequestSchema>({
		defaultValues: formDefaultValues,
		schema: StopsCreateRequestSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Stop>({ body: form.getValues(), method: 'POST', url: API_ROUTES.infrastructure.STOPS_CREATE }),
		onSuccess: (response) => {
			form.reset(response.data);
			unblock();
			closeStopsCreateModal();
			router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(response.data._id))));
		},
	});

	//
	// D. Setup flags

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: true,
			isCreating: false,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<StopsCreateRequest> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [handleCreate, createEnabled, editEnabled, form, isDirty, isValid, isCreating, unblock]);

	return (
		<StopsCreateFormContext.Provider value={stateValue}>
			{children}
		</StopsCreateFormContext.Provider>
	);
}

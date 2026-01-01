'use client';

/* * */

import { closeCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert, CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ScheduledAlertCreateContextState {
	actions: {
		create: () => void
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
	}
	flags: {
		isCreating: boolean
	}
}

/* * */

const ScheduledAlertCreateContext = createContext<ScheduledAlertCreateContextState | undefined>(undefined);

export function useScheduledAlertCreateContext() {
	const context = useContext(ScheduledAlertCreateContext);
	if (!context) {
		throw new Error('useScheduledAlertCreateContext must be used within a ScheduledAlertCreateContextProvider');
	}
	return context;
}

/* * */

export const ScheduledAlertCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			alertsListMutate();
			closeCreateScheduledAlertModal();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(updatedItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: ScheduledAlertCreateContextState = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		data: {
			form,
		},
		flags: {
			isCreating,
		},
	}), [
		form,
		isCreating,
	]);

	//
	// F. Render components

	return (
		<ScheduledAlertCreateContext.Provider value={contextValue}>
			{children}
		</ScheduledAlertCreateContext.Provider>
	);

	//
};

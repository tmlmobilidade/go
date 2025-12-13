'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateStopDto>
		stop: Stop | undefined
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const StopDetailContext = createContext<StopDetailContextState | undefined>(undefined);

export const useStopDetailContext = () => {
	const context = useContext(StopDetailContext);
	if (!context) {
		throw new Error('useStopDetailContext must be used within an StopDetailContextProvider');
	}
	return context;
};

/* * */

export const StopDetailContextProvider = ({ children, stopId }: PropsWithChildren<{ stopId: string }>) => {
	//

	//
	// A. Setup variables

	//
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateStopDto>(UpdateStopSchema, stopData);

	//
	// B. Handle actions

	const { action: handleSaveStop, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'PUT', form.getValues()),
		onSuccess: () => {
			form.resetDirty();
			stopMutate();
			allStopsMutate();
		},
	});

	const { action: handleArchiveStop, isLoading: isArchiving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_ARCHIVE(stopId)),
		onSuccess: () => {
			form.resetDirty();
			stopMutate();
			allStopsMutate();
		},
	});

	const { action: handleLockStop, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_LOCK(stopId)),
		onSuccess: () => {
			form.resetDirty();
			stopMutate();
			allStopsMutate();
		},
	});

	//
	// F. Define context value

	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			delete: handleArchiveStop,
			lock: handleLockStop,
			save: handleSaveStop,
		},
		data: {
			form,
			id: stopId,
			stop: stopData,
		},
		flags: {
			error: stopError,
			loading: stopLoading,
			locking: false,
			read_only: false,
			saving: isSaving,
		},
	}), [
		stopData,
		stopLoading,
		stopError,
		form,
		isSaving,
		stopId,
	]);

	//
	// G. Render components

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);

	//
};

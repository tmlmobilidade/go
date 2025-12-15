'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopDetailContextState extends DetailContextStateTemplate {
	data: {
		form: UseFormReturnType<UpdateStopDto>
		stop: Stop | undefined
	}
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

	const meContext = useMeContext();

	//
	// A. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));

	//
	// B. Setup form

	const { form } = useTypicalForm<UpdateStopDto>(UpdateStopSchema, stopData);

	//
	// C. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_ARCHIVE(stopId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleLockStop, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL_LOCK(stopId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	//
	// D. Setup flags

	const isReadOnly = useMemo(() => {
		// ReadOnly is used to determine if the field are enabled or not.
		if (stopData?.is_locked) return true;
		if (stopData?.is_archived) return true;
		const hasPermissions = meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update);
		console.log('hasPermissions', hasPermissions);
		if (!hasPermissions) return true;
		return false;
	}, [stopData]);

	const isSaveable = useMemo(() => {
		if (stopData?.is_locked) return false;
		if (stopData?.is_archived) return false;
		if (form.isDirty()) return true;
		if (form.isValid()) return true;
		return !meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update);
	}, [stopData]);

	//
	// D. Define context value

	const contextValue: StopDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLockStop,
			save: handleSave,
		},
		data: {
			form,
			id: stopId,
			stop: stopData,
		},
		flags: {
			canSave: isSaveable,
			error: stopError,
			isDeleting,
			isLoading: stopLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
	}), [
		stopData,
		stopLoading,
		stopError,
		form,
		isReadOnly,
		isLocking,
		isSaving,
		stopId,
	]);

	//
	// E. Render components

	return (
		<StopDetailContext.Provider value={contextValue}>
			{children}
		</StopDetailContext.Provider>
	);

	//
};

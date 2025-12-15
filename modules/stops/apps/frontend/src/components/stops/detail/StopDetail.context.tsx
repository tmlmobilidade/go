'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
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
	// B. Fetch data

	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST);
	const { data: stopData, error: stopError, isLoading: stopLoading, mutate: stopMutate } = useSWR<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateStopDto>(UpdateStopSchema, stopData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			stopMutate(updatedItem);
			allStopsMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId), 'DELETE'),
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
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleted: stopData?.is_deleted,
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: stopLoading,
		isLocked: stopData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// F. Define context value

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
			canDelete,
			canLock,
			canSave,
			error: stopError,
			isDeleting,
			isLoading: stopLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
	}), [
		form,
		stopId,
		stopData,
		canDelete,
		canLock,
		canSave,
		stopError,
		isDeleting,
		stopLoading,
		isLocking,
		isReadOnly,
		isSaving,
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

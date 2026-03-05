'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Fare, PermissionCatalog, type UpdateFareDto, UpdateFareSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface FareDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		fare: Fare | null
		form: UseFormReturnType<UpdateFareDto>
		id: string
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const FareDetailContext = createContext<FareDetailContextState | undefined>(undefined);

export function useFareDetailContext() {
	const context = useContext(FareDetailContext);
	if (!context) {
		throw new Error('useFareDetailContext must be used within a FareDetailContextProvider');
	}
	return context;
}

/* * */

export const FareDetailContextProvider = ({ children, fareId }: PropsWithChildren<{ fareId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: faresListMutate } = useSWR<Fare[]>(API_ROUTES.offer.FARES_LIST);
	const { data: fareData, error: fareError, isLoading: fareLoading, mutate: fareMutate } = useSWR<Fare>(API_ROUTES.offer.FARES_DETAIL(fareId), { refreshInterval: 5000 });

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateFareDto>(UpdateFareSchema, fareData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Fare>(API_ROUTES.offer.FARES_DETAIL(fareId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			fareMutate(updatedItem);
			faresListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Fare>(API_ROUTES.offer.FARES_DETAIL(fareId), 'DELETE', fareData),
		onSuccess: () => {
			form.resetDirty();
			faresListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Fare>(API_ROUTES.offer.FARES_DETAIL_LOCK(fareId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			fareMutate(updatedItem);
			faresListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.fares.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: fareData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.fares.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.fares.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: fareData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.fares.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!fareError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: fareLoading,
		isLocked: fareData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: FareDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			fare: fareData,
			form,
			id: fareId,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: fareError,
			isDeleting,
			isLoading: fareLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		fareData,
		fareError,
		fareLoading,
		fareId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<FareDetailContext.Provider value={contextValue}>
			{children}
		</FareDetailContext.Provider>
	);

	//
};

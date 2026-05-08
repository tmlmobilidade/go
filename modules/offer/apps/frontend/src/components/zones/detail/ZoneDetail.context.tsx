'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type UpdateZoneDto, UpdateZoneSchema, type Zone } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ZoneDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateZoneDto>
		id: string
		zone: null | Zone
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const ZoneDetailContext = createContext<undefined | ZoneDetailContextState>(undefined);

export function useZoneDetailContext() {
	const context = useContext(ZoneDetailContext);
	if (!context) {
		throw new Error('useZoneDetailContext must be used within a ZoneDetailContextProvider');
	}
	return context;
}

/* * */

export const ZoneDetailContextProvider = ({ children, zoneId }: PropsWithChildren<{ zoneId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: zonesListMutate } = useSWR<Zone[]>(API_ROUTES.offer.ZONES_LIST);
	const { data: zoneData, error: zoneError, isLoading: zoneLoading, mutate: zoneMutate } = useSWR<Zone>(API_ROUTES.offer.ZONES_DETAIL(zoneId), { refreshInterval: 5000 });

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateZoneDto>(UpdateZoneSchema, zoneData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Zone>(API_ROUTES.offer.ZONES_DETAIL(zoneId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			zoneMutate(updatedItem);
			zonesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Zone>(API_ROUTES.offer.ZONES_DETAIL(zoneId), 'DELETE', zoneData),
		onSuccess: () => {
			form.resetDirty();
			zonesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Zone>(API_ROUTES.offer.ZONES_DETAIL_LOCK(zoneId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			zoneMutate(updatedItem);
			zonesListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.zones.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: zoneData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.zones.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.zones.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: zoneData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.zones.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!zoneError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: zoneLoading,
		isLocked: zoneData?.is_locked,
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

	const contextValue: ZoneDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: zoneId,
			zone: zoneData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: zoneError,
			isDeleting,
			isLoading: zoneLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		zoneData,
		zoneError,
		zoneLoading,
		zoneId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<ZoneDetailContext.Provider value={contextValue}>
			{children}
		</ZoneDetailContext.Provider>
	);

	//
};

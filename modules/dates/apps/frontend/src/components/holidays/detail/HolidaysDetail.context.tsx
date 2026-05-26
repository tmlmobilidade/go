'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday, PermissionCatalog, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface HolidaysDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateHolidayDto>
		holiday: Holiday | null
		id: string
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const HolidaysDetailContext = createContext<HolidaysDetailContextState | undefined>(undefined);

export function useHolidaysDetailContext() {
	const context = useContext(HolidaysDetailContext);
	if (!context) {
		throw new Error('useHolidaysDetailContext must be used within a HolidaysDetailContextProvider');
	}
	return context;
}

/* * */

export const HolidaysDetailContextProvider = ({ children, holidayId }: PropsWithChildren<{ holidayId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: holidaysListMutate } = useSWR<Holiday[]>(API_ROUTES.dates.HOLIDAYS_LIST);
	const { data: holidayData, error: holidayError, isLoading: holidayLoading, mutate: holidayMutate } = useSWR<Holiday>(API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateHolidayDto>(UpdateHolidaySchema, holidayData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Holiday>(API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			holidayMutate(updatedItem);
			holidaysListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Holiday>(API_ROUTES.dates.HOLIDAYS_DETAIL(holidayId), 'DELETE', holidayData),
		onSuccess: () => {
			form.resetDirty();
			holidaysListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Holiday>(API_ROUTES.dates.HOLIDAYS_DETAIL_LOCK(holidayId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			holidayMutate(updatedItem);
			holidaysListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.holidays.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: holidayData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.holidays.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.holidays.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: holidayData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.holidays.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!holidayError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: holidayLoading,
		isLocked: holidayData?.is_locked,
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

	const contextValue: HolidaysDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			holiday: holidayData,
			id: holidayId,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: holidayError,
			isDeleting,
			isLoading: holidayLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		holidayData,
		holidayError,
		holidayLoading,
		holidayId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<HolidaysDetailContext.Provider value={contextValue}>
			{children}
		</HolidaysDetailContext.Provider>
	);

	//
};

'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Period, PermissionCatalog, type UpdatePeriodDto, UpdatePeriodSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodsDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdatePeriodDto>
		id: string
		period: null | Period
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const PeriodsDetailContext = createContext<PeriodsDetailContextState | undefined>(undefined);

export function usePeriodsDetailContext() {
	const context = useContext(PeriodsDetailContext);
	if (!context) {
		throw new Error('usePeriodsDetailContext must be used within a PeriodsDetailContextProvider');
	}
	return context;
}

/* * */

export const PeriodsDetailContextProvider = ({ children, periodId }: PropsWithChildren<{ periodId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: periodsListMutate } = useSWR<Period[]>(API_ROUTES.dates.PERIODS_LIST);
	const { data: periodData, error: periodError, isLoading: periodLoading, mutate: periodMutate } = useSWR<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdatePeriodDto>(UpdatePeriodSchema, periodData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			periodMutate(updatedItem);
			periodsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL(periodId), 'DELETE', periodData),
		onSuccess: () => {
			form.resetDirty();
			periodsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.PERIODS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Period>(API_ROUTES.dates.PERIODS_DETAIL_LOCK(periodId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			periodMutate(updatedItem);
			periodsListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.periods.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: periodData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.periods.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.periods.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: periodData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.periods.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!periodError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: periodLoading,
		isLocked: periodData?.is_locked,
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

	const contextValue: PeriodsDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: periodId,
			period: periodData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: periodError,
			isDeleting,
			isLoading: periodLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		periodData,
		periodError,
		periodLoading,
		periodId,
		form,
		isSaving,
		isDeleting,
		isLocking,
		canDelete,
		canLock,
		canSave,
		isReadOnly,
		handleDelete,
		handleLock,
		handleSave,
	]);

	//
	// G. Render components

	return (
		<PeriodsDetailContext.Provider value={contextValue}>
			{children}
		</PeriodsDetailContext.Provider>
	);

	//
};

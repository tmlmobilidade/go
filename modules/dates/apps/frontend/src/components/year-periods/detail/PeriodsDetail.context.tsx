'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodsDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateYearPeriodDto>
		id: string
		period: null | YearPeriod
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

export const PeriodsDetailContextProvider = ({ children, yearPeriodId }: PropsWithChildren<{ yearPeriodId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: periodsListMutate } = useSWR<YearPeriod[]>(API_ROUTES.dates.YEAR_PERIODS_LIST);
	const { data: periodData, error: periodError, isLoading: periodLoading, mutate: periodMutate } = useSWR<YearPeriod>(API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId));

	//
	// C. Setup form

	const { formRef } = useTypicalForm<UpdateYearPeriodDto>(UpdateYearPeriodSchema, periodData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<YearPeriod>(API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId), 'PUT', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			periodMutate(updatedItem);
			periodsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<YearPeriod>(API_ROUTES.dates.YEAR_PERIODS_DETAIL(yearPeriodId), 'DELETE', periodData),
		onSuccess: () => {
			formRef.current.resetDirty();
			periodsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<YearPeriod>(API_ROUTES.dates.YEAR_PERIODS_DETAIL_LOCK(yearPeriodId)),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			periodMutate(updatedItem);
			periodsListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.year_periods.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: periodData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.year_periods.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.year_periods.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: periodData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.year_periods.scope,
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
		isDirty: formRef.current.isDirty(),
		isLoading: periodLoading,
		isLocked: periodData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: formRef.current.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: PeriodsDetailContextState = {
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form: formRef.current,
			id: yearPeriodId,
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
	};

	//
	// G. Render components

	return (
		<PeriodsDetailContext.Provider value={contextValue}>
			{children}
		</PeriodsDetailContext.Provider>
	);

	//
};

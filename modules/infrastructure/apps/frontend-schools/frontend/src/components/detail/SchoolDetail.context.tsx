'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type School, type UpdateSchoolDto, UpdateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { type DetailContextStateTemplate, fetchApiData, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, useHandleUpdate, useMeContext, useStandardForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useSchoolsListData } from '../list/use-schools-list-data';

/* * */

interface SchoolDetailContextState extends DetailContextStateTemplate<UpdateSchoolDto> {
	actions: DetailContextStateTemplate<UpdateSchoolDto>['actions']
	data: {
		id: string | undefined
		school: School | undefined
	}
	flags: DetailContextStateTemplate<UpdateSchoolDto>['flags']
}

/* * */

const SchoolDetailContext = createContext<SchoolDetailContextState | undefined>(undefined);

export function useSchoolDetailContext() {
	const context = useContext(SchoolDetailContext);
	if (!context) {
		throw new Error('useSchoolDetailContext must be used within a SchoolDetailContextProvider');
	}
	return context;
}

/* * */

export const SchoolDetailContextProvider = ({ children, schoolId }: PropsWithChildren<{ schoolId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch Data

	const { mutate: schoolsListMutate } = useSchoolsListData();
	const { data: schoolResponse, error: schoolError, isLoading: schoolLoading, isValidating: schoolValidating, mutate: schoolMutate } = useSWR<ApiResponse<School>>(API_ROUTES.schools.SCHOOLS_DETAIL(schoolId), {
		fetcher: async (url: string) => await fetchApiData<School>({ url }),
	});
	const schoolData = schoolResponse?.data;

	//
	// C. Setup form

	const { form } = useStandardForm<UpdateSchoolDto, typeof UpdateSchoolSchema>({
		apiData: schoolData,
		schema: UpdateSchoolSchema,
	});

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.schools.SCHOOLS_DETAIL(schoolId) }),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem.data);
			schoolMutate();
			schoolsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ method: 'DELETE', url: API_ROUTES.schools.SCHOOLS_DETAIL(schoolId) }),
		onSuccess: () => {
			schoolsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.schools.SCHOOLS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ method: 'GET', url: API_ROUTES.schools.SCHOOLS_DETAIL_LOCK(schoolId) }),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem.data);
			schoolMutate();
			schoolsListMutate();
		},
	});

	//
	// F. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.read,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?.agency_id,
			},
		]),
		isDeleting: isDeleting,
		isLoading: schoolLoading,
		isLocked: schoolData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.update,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?.agency_id,
			},
		]),
		isDeleting: isDeleting,
		isDirty: form.formState.isDirty,
		isLoading: schoolLoading,
		isLocked: schoolData?.is_locked,
		isLocking: isLocking,
		isValid: Object.keys(form.formState.errors).length === 0,
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.lock,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?.agency_id,
			},
		]),
		isDeleting: isDeleting,
		isDirty: form.formState.isDirty,
		isLoading: schoolLoading,
		isLocking: isLocking,
		isValid: form.formState.isValid,
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.delete,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?.agency_id,
			},
		]),
		isDeleting: isDeleting,
		isDirty: form.formState.isDirty,
		isLoading: schoolLoading,
		isLocked: schoolData?.is_locked,
		isLocking: isLocking,
		isValid: form.formState.isValid,
	});

	//
	// E. Define context value

	const contextValue: SchoolDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			id: schoolId,
			school: schoolData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: schoolError,
			isDeleting,
			isDirty: form.formState.isDirty,
			isLoading: schoolLoading,
			isLocking,
			isReadOnly,
			isSaving,
			isValidating: schoolValidating,
		},
		form: {
			instance: form,
		},
	}), [canDelete, canLock, canSave, form, handleDelete, handleLock, handleSave, isDeleting, isLocking, isReadOnly, isSaving, schoolData, schoolError, schoolId, schoolLoading, schoolValidating]);

	//
	// F. Render components

	return (
		<SchoolDetailContext.Provider value={contextValue}>
			{children}
		</SchoolDetailContext.Provider>
	);

	//
};

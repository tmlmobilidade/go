'use client';

// import { isValidOptionalAlertCoordinates } from '@/lib/alert-coordinates';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type School, type UpdateSchoolDto } from '@tmlmobilidade/go-types-operation';
import { type DetailContextStateTemplate, keepUrlParams, useContextForm, useFlagCanDelete, useFlagCanDuplicate, useFlagCanLock, useFlagCanSave, useFlagReadOnly, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

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

	const { mutate: schoolsListMutate } = useSWR<School[]>(API_ROUTES.operation.SCHOOLS_LIST);
	const { data: schoolData, error: schoolError, isLoading: schoolLoading, isValidating: schoolValidating, mutate: schoolMutate } = useSWR<School>(API_ROUTES.operation.SCHOOLS_DETAIL(schoolId));

	//
	// C. Setup form

	const { form } = useContextForm<UpdateSchoolDto>({
		apiData: schoolData,
		schema: UpdateSchoolDtoSchema,
	});

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<School>(API_ROUTES.operation.SCHOOLS_DETAIL(schoolId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem);
			schoolMutate(updatedItem);
			schoolsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<School>(API_ROUTES.operation.SCHOOLS_DETAIL(schoolId), 'DELETE'),
		onSuccess: () => {
			schoolsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<School>(API_ROUTES.operation.SCHOOLS_DETAIL_LOCK(schoolId)),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem);
			schoolMutate(updatedItem);
			schoolsListMutate();
		},
	});

	//
	// F. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.update,
				resource_key: 'school_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?._id,
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
				resource_key: 'school_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?._id,
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
				resource_key: 'school_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?._id,
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
				resource_key: 'school_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?._id,
			},
		]),
		isDeleting: isDeleting,
		isDirty: form.formState.isDirty,
		isLoading: schoolLoading,
		isLocked: schoolData?.is_locked,
		isLocking: isLocking,
		isValid: form.formState.isValid,
	});

	const { canDuplicate } = useFlagCanDuplicate({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.schools.actions.create,
				resource_key: 'school_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: schoolData?._id,
			},
		]),
		isDeleting: isDeleting,
		isDirty: form.formState.isDirty,
		isLoading: schoolLoading,
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
			canDuplicate,
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
	}), [canDelete, canDuplicate, canLock, canSave, form, handleDelete, handleLock, handleSave, isDeleting, isLocking, isReadOnly, isSaving, schoolData, schoolError, schoolId, schoolLoading, schoolValidating]);

	//
	// F. Render components

	return (
		<SchoolDetailContext.Provider value={contextValue}>
			{children}
		</SchoolDetailContext.Provider>
	);

	//
};

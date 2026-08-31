'use client';

import { useSchoolsListData } from '@/components/schools/list/use-schools-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type School, type UpdateSchoolDto, UpdateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, fetchApiData, keepUrlParams, useHandleUpdate, useMeContext, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useSchoolsDetailSchoolData } from './use-schools-detail-school-data';
import { useSchoolsDetailSchoolId } from './use-schools-detail-school-id';

/* * */

const SchoolsDetailFormContext = createContext<StandardFormContextValue<UpdateSchoolDto> | undefined>(undefined);

export function useSchoolsDetailFormContext() {
	const context = useContext(SchoolsDetailFormContext);
	if (!context) throw new Error('useSchoolsDetailFormContext must be used within a SchoolsDetailFormContextProvider');
	return context;
}

/* * */

export function SchoolsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const meContext = useMeContext();

	const { schoolId } = useSchoolsDetailSchoolId();

	const { mutate: schoolsListMutate } = useSchoolsListData();

	const { data: schoolData, isLoading: schoolDataLoading, mutate: schoolsDetailMutate } = useSchoolsDetailSchoolData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateSchoolDto, typeof UpdateSchoolSchema>({
		apiData: schoolData,
		schema: UpdateSchoolSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.infrastructure.SCHOOLS_DETAIL(schoolId!) }),
		onSuccess: (response) => {
			form.reset(response.data);
			schoolsDetailMutate(response);
			schoolsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ method: 'DELETE', url: API_ROUTES.infrastructure.SCHOOLS_DETAIL(schoolId!) }),
		onSuccess: () => {
			schoolsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ method: 'GET', url: API_ROUTES.infrastructure.SCHOOLS_DETAIL_LOCK(schoolId!) }),
		onSuccess: (response) => {
			form.reset(response.data);
			schoolsDetailMutate(response);
			schoolsListMutate();
		},
	});

	//
	// D. Setup flags

	const hasDeletePermission = useMemo(() => {
		return meContext.actions.hasPermissionResource([{
			action: PermissionCatalog.all.schools.actions.delete,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: schoolData?.agency_id,
		}]);
	}, [meContext.actions, schoolData?.agency_id]);

	const hasUpdatePermission = useMemo(() => {
		return meContext.actions.hasPermissionResource([{
			action: PermissionCatalog.all.schools.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: schoolData?.agency_id,
		}]);
	}, [meContext.actions, schoolData?.agency_id]);

	const hasLockPermission = useMemo(() => {
		return meContext.actions.hasPermissionResource([{
			action: PermissionCatalog.all.schools.actions.lock,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: schoolData?.agency_id,
		}]);
	}, [meContext.actions, schoolData?.agency_id]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: schoolDataLoading,
		},
		locked: {
			hasPermission: hasLockPermission,
			isLocked: schoolData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateSchoolDto> = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading: schoolDataLoading,
			isLocked: schoolData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isLocking, isUpdating, lockEnabled, schoolData?.is_locked, schoolDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<SchoolsDetailFormContext.Provider value={stateValue}>
			{children}
		</SchoolsDetailFormContext.Provider>
	);
}

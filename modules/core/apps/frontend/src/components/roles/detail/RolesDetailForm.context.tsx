'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Role, type UpdateRoleDto, UpdateRoleSchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRolesListData } from '../list/use-roles-list-data';
import { useRolesDetailData } from './use-roles-detail-data';
import { useRolesDetailRoleId } from './use-roles-detail-role-id';

/* * */

const RolesDetailFormContext = createContext<StandardFormContextValue<UpdateRoleDto> | undefined>(undefined);

export function useRolesDetailFormContext() {
	const context = useContext(RolesDetailFormContext);
	if (!context) throw new Error('useRolesDetailFormContext must be used within a RolesDetailFormContextProvider');
	return context;
}

/* * */

export function RolesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { roleId } = useRolesDetailRoleId();

	const { data: meData } = useMeData();

	const { mutate: rolesListMutate } = useRolesListData();

	const { data: roleData, isLoading: roleDataLoading, mutate: rolesDetailMutate } = useRolesDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateRoleDto, typeof UpdateRoleSchema>({
		apiData: roleData,
		schema: UpdateRoleSchema,
	});

	//
	// D. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.ROLES_DETAIL(roleId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			rolesDetailMutate();
			rolesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ method: 'DELETE', url: API_ROUTES.core.ROLES_DELETE(roleId) }),
		onSuccess: () => {
			rolesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ method: 'PUT', url: API_ROUTES.core.ROLES_DETAIL(roleId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			rolesDetailMutate();
			rolesListMutate();
		},
	});

	//
	// C. Setup flags

	const hasDeletePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'delete',
			scope: 'roles',
		});
	}, [meData?.permissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'roles',
		});
	}, [meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty: isDirty,
			isValid: form.formState.isValid,
		},
		loading: {
			isLoading: roleDataLoading,
		},
		locked: {
			hasPermission: hasUpdatePermission,
			isLocked: roleData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateRoleDto> = useMemo(() => ({
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
		status: {
			isDeleting,
			isDirty,
			isLoading: roleDataLoading,
			isLocked: roleData?.is_locked,
			isLocking,
			isUpdating,
			isValid: form.formState.isValid,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isDirty, isLocking, isUpdating, lockEnabled, roleData?.is_locked, roleDataLoading, unblock, updateEnabled]);

	return (
		<RolesDetailFormContext.Provider value={stateValue}>
			{children}
		</RolesDetailFormContext.Provider>
	);
}

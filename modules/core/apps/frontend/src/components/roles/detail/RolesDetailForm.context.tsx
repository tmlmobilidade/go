'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Role, type UpdateRoleDto, UpdateRoleSchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type FormContextStateTemplate, useStandardForm, useFormFlags, useMeData } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRolesListData } from '../list/use-roles-list-data';
import { useRolesDetailData } from './use-roles-detail-data';
import { useRolesDetailRoleId } from './use-roles-detail-role-id';

/* * */

const RolesDetailFormContext = createContext<FormContextStateTemplate<UpdateRoleDto> | undefined>(undefined);

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

	const { data: roleData, mutate: rolesDetailMutate } = useRolesDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateRoleDto, typeof UpdateRoleSchema>({
		apiData: roleData,
		schema: UpdateRoleSchema,
	});

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.ROLES_DETAIL(roleId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			rolesDetailMutate();
			rolesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ method: 'DELETE', url: API_ROUTES.core.ROLES_DETAIL(roleId) }),
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

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useFormFlags({
		deletePermission: hasDeletePermission,
		isDirty: form.formState.isDirty,
		isLoading: isSaving || isDeleting || isLocking,
		isLocked: roleData?.is_locked,
		isValid: form.formState.isValid,
		updatePermission: hasUpdatePermission,
	});

	//
	// E. Return state

	const stateValue: FormContextStateTemplate<UpdateRoleDto> = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		flags: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleSave, isDirty, lockEnabled, unblock, updateEnabled]);

	return (
		<RolesDetailFormContext.Provider value={stateValue}>
			{children}
		</RolesDetailFormContext.Provider>
	);
}

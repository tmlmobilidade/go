'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ActionsOf, type Permission, PermissionCatalog, PermissionSchema, type Role, type UpdateRoleDto, UpdateRoleSchema } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RoleDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
	}
	data: {
		form: UseFormReturnType<UpdateRoleDto>
		id: string | undefined
		role: Role | undefined
	}
}

/* * */

const RoleDetailContext = createContext<RoleDetailContextState | undefined>(undefined);

export function useRoleDetailContext() {
	const context = useContext(RoleDetailContext);
	if (!context) {
		throw new Error('useRoleDetailContext must be used within a RoleDetailContextProvider');
	}
	return context;
}

/* * */

export const RoleDetailContextProvider = ({ children, roleId }: PropsWithChildren<{ roleId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: allRolesMutate } = useSWR<Role[]>(API_ROUTES.auth.ROLES_LIST);
	const { data: roleData, error: roleError, isLoading: roleLoading, mutate: roleMutate } = useSWR<Role>(API_ROUTES.auth.ROLES_DETAIL(roleId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateRoleDto>(UpdateRoleSchema, roleData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Role>(API_ROUTES.auth.ROLES_DETAIL(roleId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			meContext.mutate.me();
			roleMutate(updatedItem);
			allRolesMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Role>(API_ROUTES.auth.ROLES_DETAIL(roleId), 'DELETE'),
		onSuccess: () => {
			meContext.mutate.me();
			allRolesMutate();
			router.push(keepUrlParams(PAGE_ROUTES.auth.ROLES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Role>(API_ROUTES.auth.ROLES_DETAIL_LOCK(roleId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			meContext.mutate.me();
			roleMutate(updatedItem);
			allRolesMutate();
		},
	});

	const handlePermissionToggle = (scope: string, action: string) => {
		// Get latest form values
		const latestValues = form.getValues();
		// Check if a permission entry with the same scope and action already exists
		if (latestValues.permissions?.find(p => p.scope === scope && p.action === action)) {
			const updatedPermissions = latestValues.permissions.filter(p => p.scope !== scope || p.action !== action);
			form.setFieldValue('permissions', updatedPermissions);
			return;
		}
		// If it doesn't exist, add a new permission entry
		const permissionValidated = PermissionSchema.safeParse({ action: action, scope: scope });
		if (!permissionValidated.success) return alert('Erro ao adicionar permissão: ' + JSON.stringify(permissionValidated.error));
		form.setFieldValue('permissions', [...latestValues.permissions ?? [], permissionValidated.data]);
	};

	function handlePermissionResourceToggle<S extends Permission['scope']>(scope: S, action: ActionsOf<S>, resource: Record<string, unknown>) {
		// Use the PermissionCatalog method to update permission resources
		const updatedPermissions = PermissionCatalog.updatePermissionResource(
			form.getValues().permissions ?? [],
			scope,
			action,
			resource,
		);
			// Update the form with the new permissions array
		form.setFieldValue('permissions', updatedPermissions);
	};

	//
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.update),
		isDeleting: isDeleting,
		isLoading: roleLoading,
		isLocked: roleData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: roleLoading,
		isLocked: roleData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: roleLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.roles.scope, PermissionCatalog.all.roles.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: roleLoading,
		isLocked: roleData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// F. Define context value

	const contextValue: RoleDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			handlePermissionResourceToggle,
			handlePermissionToggle,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: roleId,
			role: roleData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: roleError,
			isDeleting,
			isLoading: roleLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
	}), [
		canDelete,
		canLock,
		canSave,
		roleError,
		isDeleting,
		roleLoading,
		isLocking,
		isReadOnly,
		isSaving,
		form,
		roleData,
		roleId,
	]);

	//
	// G. Render components

	return (
		<RoleDetailContext.Provider value={contextValue}>
			{children}
		</RoleDetailContext.Provider>
	);

	//
};

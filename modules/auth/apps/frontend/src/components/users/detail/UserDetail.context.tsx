'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, PermissionSchema, type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UserDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		handleChangePassword: (scope: string) => void
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
	}
	data: {
		form: UseFormReturnType<UpdateUserDto>
		id: string | undefined
		user: undefined | User
	}
}

/* * */

const UserDetailContext = createContext<undefined | UserDetailContextState>(undefined);

export function useUserDetailContext() {
	const context = useContext(UserDetailContext);
	if (!context) {
		throw new Error('useUserDetailContext must be used within a UserDetailContextProvider');
	}
	return context;
}

/* * */

export const UserDetailContextProvider = ({ children, userId }: PropsWithChildren<{ userId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: allUsersMutate } = useSWR<User[]>(API_ROUTES.auth.USERS_LIST);
	const { data: userData, error: userError, isLoading: userLoading, mutate: userMutate } = useSWR<User>(userId === 'new' ? null : API_ROUTES.auth.USERS_DETAIL(userId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateUserDto>(UpdateUserSchema, userData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<User>(API_ROUTES.auth.USERS_DETAIL(userId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			meContext.mutate.me();
			userMutate(updatedItem);
			allUsersMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<User>(API_ROUTES.auth.USERS_DETAIL(userId), 'DELETE'),
		onSuccess: () => {
			meContext.mutate.me();
			allUsersMutate();
			router.push(keepUrlParams(PAGE_ROUTES.auth.USERS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<User>(API_ROUTES.auth.USERS_DETAIL_LOCK(userId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			meContext.mutate.me();
			userMutate(updatedItem);
			allUsersMutate();
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

	function handlePermissionResourceToggle(scope: string, action: string, resource: Record<string, unknown>) {
		// Get latest form values
		const latestValues = form.getValues();
		// Check if a permission entry with the same scope and action exists
		const foundPermission = latestValues.permissions?.find(p => p.scope === scope && p.action === action);
		if (!foundPermission) return alert('Permissão não encontrada para atualizar recursos');
		// Assign the new resources to the found permission
		foundPermission['resources'] = resource;
		// Update the resources of the found permission
		form.setFieldValue('permissions', [...latestValues.permissions ?? []]);
	};

	function handleChangePassword(value: string) {
		const passwordHash = bcrypt.hashSync(value);
		form.setFieldValue('password_hash', passwordHash);
	}

	//
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.users.scope, PermissionCatalog.all.users.actions.update),
		isDeleting: isDeleting,
		isLoading: userLoading,
		isLocked: userData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.users.scope, PermissionCatalog.all.users.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: userLoading,
		isLocked: userData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.users.scope, PermissionCatalog.all.users.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: userLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: userLoading,
		isLocked: userData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// E. Define context value

	const contextValue: UserDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			handleChangePassword,
			handlePermissionResourceToggle,
			handlePermissionToggle,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: userId === 'new' ? undefined : userId,
			user: userData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: userError,
			isDeleting,
			isLoading: userLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
	}), [
		canDelete,
		canLock,
		canSave,
		userError,
		isDeleting,
		userLoading,
		isLocking,
		isReadOnly,
		isSaving,
		form,
		userData,
		userId,
	]);

	//
	// F. Render components

	return (
		<UserDetailContext.Provider value={contextValue}>
			{children}
		</UserDetailContext.Provider>
	);

	//
};

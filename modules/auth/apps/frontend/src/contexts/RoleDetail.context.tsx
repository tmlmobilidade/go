'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateRoleDto, CreateRoleSchema, PermissionSchema, type Role } from '@tmlmobilidade/types';
import { UseFormReturnType, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum RoleDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface RoleDetailContextState {
	actions: {
		deleteRole: () => void
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
		saveRole: () => void
	}
	data: {
		form: UseFormReturnType<CreateRoleDto>
		id: string | undefined
	}
	flags: {
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: RoleDetailMode
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

	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);

	//
	// B. Fetch data

	const { mutate: allRolesMutate } = useSWR<Role[]>(API_ROUTES.auth.ROLES_LIST);
	const { data: roleData, isLoading: roleLoading } = useSWR<Role>(roleId === 'new' ? null : API_ROUTES.auth.ROLES_DETAIL(roleId));

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateRoleDto>(CreateRoleSchema, roleData);

	//
	// D. Handle actions

	const handleSaveRole = async () => {
		setIsSaving(true);
		const method = roleId === 'new' ? 'POST' : 'PUT';
		const url = roleId === 'new' ? API_ROUTES.auth.ROLES_LIST : API_ROUTES.auth.ROLES_DETAIL(roleId);
		const response = await fetchData<Role>(url, method, form.getValues());

		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({
					message: response.error,
					title: 'Erro ao salvar utilizador',
				});
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({
						message: error.message,
						title: 'Erro ao salvar utilizador',
					});
				}
			}

			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Grupo guardado com sucesso',
			title: 'Sucesso',
		});

		if (roleId === 'new' && response.data?._id) {
			router.replace(PAGE_ROUTES.auth.ROLES_DETAIL(response.data._id));
		}

		meContext.mutate.me();
		allRolesMutate();

		setIsSaving(false);
	};

	const handleDeleteRole = async () => {
		// Skip if new user
		if (roleId === 'new') return;
		// Confirm deletion
		const response = await fetchData<Role>(API_ROUTES.auth.ROLES_DETAIL(roleId), 'DELETE');
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar grupo',
				});
			}
			return;
		}

		useToast.success({
			message: 'Grupo apagado com sucesso',
			title: 'Sucesso',
		});

		router.replace(PAGE_ROUTES.auth.ROLES_LIST);
	};

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

	//
	// E. Define context value

	const contextValue: RoleDetailContextState = useMemo(() => ({
		actions: {
			deleteRole: handleDeleteRole,
			handlePermissionResourceToggle,
			handlePermissionToggle,
			saveRole: handleSaveRole,
		},
		data: {
			form,
			id: roleId === 'new' ? undefined : roleId,
		},
		flags: {
			isReadOnly,
			isSaving,
			loading: roleLoading,
			mode: roleId === 'new' ? RoleDetailMode.CREATE : RoleDetailMode.EDIT,
		},
	}), [
		isReadOnly,
		isSaving,
		roleId,
		roleLoading,
	]);

	//
	// F. Render components

	return (
		<RoleDetailContext.Provider value={contextValue}>
			{children}
		</RoleDetailContext.Provider>
	);

	//
};

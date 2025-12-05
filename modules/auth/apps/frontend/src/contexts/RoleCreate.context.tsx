'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateRoleDto, CreateRoleSchema, PermissionSchema, Role } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RoleCreateContextState {
	actions: {
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
		saveRole: () => void
	}
	data: {
		form: UseFormReturnType<CreateRoleDto>
	}
	flags: {
		isReadOnly: boolean
		isSaving: boolean
	}
	modal: {
		close: () => void
		open: () => void
		state: boolean
	}
}

/* * */

const RoleCreateContext = createContext<RoleCreateContextState | undefined>(undefined);

export function useRoleCreateContext() {
	const context = useContext(RoleCreateContext);
	if (!context) {
		throw new Error('useRoleCreateContext must be used within a RoleCreateContextProvider');
	}
	return context;
}

/* * */

export const RoleCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [modalState, setModalState] = useState(false);

	//
	// B. Fetch data

	const { mutate: allRolesMutate } = useSWR<Role[]>(API_ROUTES.auth.ROLES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateRoleDto>(CreateRoleSchema);

	//
	// D. Handle actions

	const handleSaveRole = async () => {
		setIsSaving(true);
		const response = await fetchData<Role>(API_ROUTES.auth.ROLES_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao salvar Role' });
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao salvar Role' });
				}
			}
			setIsSaving(false);
			return;
		}
		form.resetDirty();
		useToast.success({ message: 'Role salvo com sucesso', title: 'Sucesso' });
		if (response.data?._id) {
			router.replace(PAGE_ROUTES.auth.ROLES_DETAIL(response.data._id));
		}
		allRolesMutate();
		setIsSaving(false);
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

	const contextValue: RoleCreateContextState = useMemo(() => ({
		actions: {
			handlePermissionResourceToggle,
			handlePermissionToggle,
			saveRole: handleSaveRole,
		},
		data: {
			form,
		},
		flags: {
			isReadOnly,
			isSaving,
		},
		modal: {
			close: () => setModalState(false),
			open: () => setModalState(true),
			state: modalState,
		},
	}), [
		form,
		modalState,
		isReadOnly,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<RoleCreateContext.Provider value={contextValue}>
			{children}
		</RoleCreateContext.Provider>
	);

	//
};

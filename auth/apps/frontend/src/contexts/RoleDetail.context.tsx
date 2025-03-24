'use client';

import { fetchData, swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { convertObject, CreateRoleDto, Permission, Permissions, Role, RoleSchema, UpdateRoleSchema } from '@tmlmobilidade/core-types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export enum RoleDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

export const availablePermissions = Object.entries(Permissions).map(([scope, value]) => ({
	children: Object.entries(value.actions).map(([action]) => ({
		label: action,
		value: `${scope}-${action}`,
	})),
	label: scope,
	value: scope,
}));

interface RoleDetailContextState {
	actions: {
		deleteRole: () => void
		handlePermissionChange: (permission_id: string) => void
		saveRole: () => void
	}
	data: {
		form: UseFormReturnType<CreateRoleDto>
		id: string | undefined
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: RoleDetailMode
	}
}

const emptyRole: CreateRoleDto = {
	name: '',
	permissions: [],
};

const RoleDetailContext = createContext<RoleDetailContextState | undefined>(undefined);

export function useRoleDetailContext() {
	const context = useContext(RoleDetailContext);
	if (!context) {
		throw new Error('useRoleDetailContext must be used within a RoleDetailContextProvider');
	}
	return context;
}

export const RoleDetailContextProvider = ({ children, role_id }: { children: React.ReactNode, role_id: string }) => {
	//
	// A. Setup variables
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);

	const { data: role, isLoading } = useSWR<Role>(role_id === 'new' ? null : Routes.AUTH_API + Routes.ROLE_DETAIL(role_id), swrFetcher);

	//
	// B. Define form
	const form = useForm<CreateRoleDto>({
		initialValues: role || emptyRole,
		validate: zodResolver(RoleSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	// Update form
	useEffect(() => {
		if (!role) return;

		setLoading(true);

		form.initialize(role);

		setLoading(false);
	}, [role]);

	//
	// C. Transform Data
	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Handle Actions
	const handleSaveRole = async () => {
		setIsSaving(true);
		const method = role_id === 'new' ? 'POST' : 'PUT';
		const url = role_id === 'new' ? Routes.AUTH_API + Routes.USERS : Routes.AUTH_API + Routes.USER_DETAIL(role_id);
		const body = role_id === 'new' ? form.values : convertObject(form.values, UpdateRoleSchema);
		const response = await fetchData<Role>(url, method, body);

		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar utilizador',
				});
			}

			return;
		}

		useToast.success({
			message: 'Utilizador salvo com sucesso',
			title: 'Sucesso',
		});

		if (role_id === 'new' && response.data?._id) {
			router.replace(Routes.USER_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteRole = async () => {
		if (role_id === 'new') return;

		const response = await fetchData<Role>(Routes.AUTH_API + Routes.USER_DETAIL(role_id), 'DELETE', role);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar utilizador',
				});
			}
			return;
		}

		useToast.success({
			message: 'Utilizador apagado com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.USERS);
	};

	/**
	 * @param permission_id - The permission id to be added or removed
	 * @description This function will add or remove a permission from the role
	 *
	 * @example - handlePermissionChange('role-create') // Select the create permission for the role scope
	 * @example - handlePermissionChange('*') // Select all permissions
	 * @example - handlePermissionChange('!*') // Deselect all permissions
	 */
	const handlePermissionChange = (permission_id: string) => {
		const [scope, action] = permission_id.split('-');

		const updatePermissions = (newPermissions: Permission<unknown>[]) => {
			form.setFieldValue('permissions', newPermissions);
		};

		if (permission_id === '*') {
			const allPermissions = Object.entries(Permissions).flatMap(([scope, { actions }]) =>
				Object.keys(actions).map(action => ({ action, scope })),
			);
			updatePermissions(allPermissions);
			return;
		}

		if (permission_id === '!*') {
			updatePermissions([]);
			return;
		}

		const availableActions = Permissions[scope as keyof typeof Permissions]?.actions;
		if (!availableActions) return;

		const currentPermissions = form.values.permissions?.filter(permission => permission.scope === scope) ?? [];

		if (!action) {
			const allActions = Object.keys(availableActions);
			const newPermissions = currentPermissions.length === allActions.length
				? form.values.permissions?.filter(permission => permission.scope !== scope) ?? []
				: [
					...(form.values.permissions?.filter(permission => permission.scope !== scope) ?? []),
					...allActions.map(action => ({ action, scope })),
				];
			updatePermissions(newPermissions as Permission<unknown>[]);
			return;
		}

		const isPermissionPresent = currentPermissions.some(permission => permission.action === action);
		const newPermissions = isPermissionPresent
			? form.values.permissions?.filter(permission => !(permission.scope === scope && permission.action === action)) ?? []
			: [...(form.values.permissions ?? []), { action, scope }];
		updatePermissions(newPermissions as Permission<unknown>[]);
	};

	//
	// E. Define context value
	const contextValue: RoleDetailContextState = {
		actions: {
			deleteRole: handleDeleteRole,
			handlePermissionChange,
			saveRole: handleSaveRole,
		},
		data: {
			form,
			id: role_id === 'new' ? undefined : role_id,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: role_id === 'new' ? RoleDetailMode.CREATE : RoleDetailMode.EDIT,
		},
	};

	//
	// F. Render components
	return (
		<RoleDetailContext.Provider value={contextValue}>
			{children}
		</RoleDetailContext.Provider>
	);
};

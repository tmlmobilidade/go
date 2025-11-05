'use client';

import { Routes } from '@/lib/routes';
import { Permissions } from '@tmlmobilidade/consts';
import { CreateRoleDto, CreateRoleSchema, Role, RoleSchema, UpdateRoleSchema } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
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
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
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
	created_by: '',
	name: '',
	permissions: [],
	updated_by: '',
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

	const { data: role, isLoading } = useSWR<Role>(role_id === 'new' ? null : Routes.API(Routes.ROLE_DETAIL(role_id)));

	//
	// B. Define form
	const form = useForm<CreateRoleDto>({
		initialValues: role || emptyRole,
		validate: zodResolver(role_id === 'new' ? CreateRoleSchema : RoleSchema),
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
	// D. Handle actions
	const handleSaveRole = async () => {
		setIsSaving(true);
		const method = role_id === 'new' ? 'POST' : 'PUT';
		const url = role_id === 'new' ? Routes.API(Routes.ROLES) : Routes.API(Routes.ROLE_DETAIL(role_id));
		const body = role_id === 'new' ? form.values : convertObject(form.values, UpdateRoleSchema);
		const response = await fetchData<Role>(url, method, body);

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
			router.replace(Routes.ROLE_DETAIL(response.data?._id));
			return;
		}

		useToast.success({
			message: 'Grupo guardado com sucesso',
			title: 'Sucesso',
		});

		if (role_id === 'new' && response.data?._id) {
			router.replace(Routes.ROLE_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteRole = async () => {
		if (role_id === 'new') return;

		const response = await fetchData<Role>(Routes.API(Routes.ROLE_DETAIL(role_id)), 'DELETE');
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

		router.replace(Routes.ROLES);
	};

	const handlePermissionToggle = (scope: string, action: string) => {
		console.log('HERE =======> ', 'permission');
		const currentPermissions = form.values.permissions;

		if (currentPermissions.find(permission => permission.scope === scope && permission.action === action)) {
			form.setFieldValue('permissions', currentPermissions.filter(permission => permission.scope !== scope || permission.action !== action));
		}
		else {
			form.setFieldValue('permissions', [...currentPermissions, { action, scope }]);
		}
	};

	const handlePermissionResourceToggle = (scope: string, action: string, resource: Record<string, unknown>) => {
		const currentPermissions = form.values.permissions;
		const permission = currentPermissions.find(permission => permission.scope === scope && permission.action === action);

		if (!permission) return;

		permission.resource = { ...permission.resource, ...resource };
		form.setFieldValue('permissions', currentPermissions);
	};

	//
	// E. Define context value
	const contextValue: RoleDetailContextState = {
		actions: {
			deleteRole: handleDeleteRole,
			handlePermissionResourceToggle,
			handlePermissionToggle,
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

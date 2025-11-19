'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateUserDto, CreateUserSchema, Permission, UpdateUserSchema, User } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum UsersDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface UsersDetailContextState {
	actions: {
		deleteUser: () => void
		handleChangePassword: (scope: string) => void
		handlePermissionResourceToggle: (scope: string, action: string, resource: Record<string, unknown>) => void
		handlePermissionToggle: (scope: string, action: string) => void
		saveUser: () => void
	}
	data: {
		form: UseFormReturnType<CreateUserDto>
		id: string | undefined
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: UsersDetailMode
	}
}

const emptyUser: CreateUserDto = {
	created_by: '',
	email: '',
	first_name: '',
	last_name: '',
	organization_id: '',
	permissions: [],
	phone: '',
	role_ids: [],
	session_ids: [],
	updated_by: '',
	verification_token_ids: [],
};

/* * */

const UsersDetailContext = createContext<undefined | UsersDetailContextState>(undefined);

export function useUsersDetailContext() {
	const context = useContext(UsersDetailContext);
	if (!context) {
		throw new Error('useUsersDetailContext must be used within a UsersDetailContextProvider');
	}
	return context;
}

/* * */

export const UsersDetailContextProvider = ({ children, userId }: PropsWithChildren<{ userId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);

	//
	// B. Fetch data

	const { data: user, isLoading } = useSWR<User>(userId === 'new' ? null : API_ROUTES.auth.USERS_DETAIL(userId));

	//
	// C. Initialize form

	const form = useForm<CreateUserDto>({
		initialValues: emptyUser,
		validate: zodResolver(CreateUserSchema) as unknown as FormValidateInput<CreateUserDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!user) return;
		setLoading(true);
		form.initialize(convertObject(user, CreateUserSchema));
		setLoading(false);
	}, [user]);

	//
	// C. Transform Data

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Handle actions

	const handleSaveUser = async () => {
		setIsSaving(true);
		const method = userId === 'new' ? 'POST' : 'PUT';
		const url = userId === 'new' ? API_ROUTES.auth.USERS_LIST : API_ROUTES.auth.USERS_DETAIL(userId);
		const body = userId === 'new' ? form.values : convertObject(form.values, UpdateUserSchema);
		const response = await fetchData<User>(url, method, body);

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
			message: 'Utilizador salvo com sucesso',
			title: 'Sucesso',
		});

		if (userId === 'new' && response.data?._id) {
			router.replace(PAGE_ROUTES.auth.USERS_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteUser = async () => {
		if (userId === 'new') return;

		const response = await fetchData<User>(API_ROUTES.auth.USERS_DETAIL(userId), 'DELETE', user);
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

		router.replace(PAGE_ROUTES.auth.USERS_LIST);
	};

	const handlePermissionToggle = (scope: string, action: string) => {
		const currentPermissions = form.values.permissions;

		if (currentPermissions.find(permission => permission.scope === scope && permission.action === action)) {
			form.setFieldValue('permissions', currentPermissions.filter(permission => permission.scope !== scope || permission.action !== action));
		}
		else {
			const permissionValidated = { action: action, scope: scope } as Permission;
			form.setFieldValue('permissions', [...currentPermissions, permissionValidated]);
		}
	};

	const handlePermissionResourceToggle = (scope: string, action: string, resource: Record<string, unknown>) => {
		const currentPermissions = form.values.permissions;
		const permission = currentPermissions.find(permission => permission.scope === scope && permission.action === action);

		if (!permission || !('resources' in permission)) return;

		permission.resources = { ...permission.resources, ...resource };
		form.setFieldValue('permissions', currentPermissions);
	};

	function handleChangePassword(value: string) {
		const password_hash = bcrypt.hashSync(value);
		form.setFieldValue('password_hash', password_hash);
	}

	//
	// E. Define context value

	const contextValue: UsersDetailContextState = useMemo(() => ({
		actions: {
			deleteUser: handleDeleteUser,
			handleChangePassword,
			handlePermissionResourceToggle,
			handlePermissionToggle,
			saveUser: handleSaveUser,
		},
		data: {
			form,
			id: userId === 'new' ? undefined : userId,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: userId === 'new' ? UsersDetailMode.CREATE : UsersDetailMode.EDIT,
		},
	}), [form, handleDeleteUser, handlePermissionResourceToggle, handlePermissionToggle, handleSaveUser, isLoading, isReadOnly, isSaving, loading, userId]);

	//
	// F. Render components

	return (
		<UsersDetailContext.Provider value={contextValue}>
			{children}
		</UsersDetailContext.Provider>
	);

	//
};

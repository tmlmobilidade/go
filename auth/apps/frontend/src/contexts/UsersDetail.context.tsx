'use client';

/* * */

import { Routes } from '@/lib/routes';
import { CreateUserDto, CreateUserSchema, UpdateUserSchema, User } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
	email: '',
	first_name: '',
	last_name: '',
	organization_ids: [],
	permissions: [],
	phone: '',
	role_ids: [],
	session_ids: [],
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

export const UsersDetailContextProvider = ({ children, user_id }: { children: React.ReactNode, user_id: string }) => {
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

	const { data: user, isLoading } = useSWR<User>(user_id === 'new' ? null : Routes.AUTH_API + Routes.USER_DETAIL(user_id));

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
		const method = user_id === 'new' ? 'POST' : 'PUT';
		const url = user_id === 'new' ? Routes.API(Routes.USERS) : Routes.API(Routes.USER_DETAIL(user_id));
		const body = user_id === 'new' ? form.values : convertObject(form.values, UpdateUserSchema);
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

		if (user_id === 'new' && response.data?._id) {
			router.replace(Routes.USER_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteUser = async () => {
		if (user_id === 'new') return;

		const response = await fetchData<User>(Routes.AUTH_API + Routes.USER_DETAIL(user_id), 'DELETE', user);
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
			id: user_id === 'new' ? undefined : user_id,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: user_id === 'new' ? UsersDetailMode.CREATE : UsersDetailMode.EDIT,
		},
	}), [form, handleDeleteUser, handlePermissionResourceToggle, handlePermissionToggle, handleSaveUser, isLoading, isReadOnly, isSaving, loading, user_id]);

	//
	// F. Render components

	return (
		<UsersDetailContext.Provider value={contextValue}>
			{children}
		</UsersDetailContext.Provider>
	);

	//
};

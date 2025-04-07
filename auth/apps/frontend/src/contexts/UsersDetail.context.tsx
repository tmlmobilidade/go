'use client';

/* * */

import { fetchData, swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { Permissions } from '@tmlmobilidade/lib';
import { CreateUserDto, CreateUserSchema, Permission, UpdateUserSchema, User } from '@tmlmobilidade/types';
import { useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { convertObject } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum UsersDetailMode {
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

interface UsersDetailContextState {
	actions: {
		deleteUser: () => void
		handlePermissionChange: (permission_id: string) => void
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

	const { data: user, isLoading } = useSWR<User>(user_id === 'new' ? null : Routes.AUTH_API + Routes.USER_DETAIL(user_id), swrFetcher);

	//
	// C. Initialize form

	const form = useForm<CreateUserDto>({
		initialValues: emptyUser,
		validate: zodResolver(CreateUserSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!user) return;

		console.log('user', user);

		setLoading(true);
		form.initialize(convertObject(user, CreateUserSchema));
		setLoading(false);
	}, [user]);

	//
	// C. Transform Data

	// Validate form on change
	useEffect(() => {
		form.validate();
		console.log(form.errors);
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Handle actions

	const handleSaveUser = async () => {
		setIsSaving(true);
		const method = user_id === 'new' ? 'POST' : 'PUT';
		const url = user_id === 'new' ? Routes.AUTH_API + Routes.USERS : Routes.AUTH_API + Routes.USER_DETAIL(user_id);
		const body = user_id === 'new' ? form.values : convertObject(form.values, UpdateUserSchema);
		const response = await fetchData<User>(url, method, body);

		console.log(response);

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

	/**
	 * @param permission_id - The permission id to be added or removed
	 * @description This function will add or remove a permission from the user
	 *
	 * @example - handlePermissionChange('user-create') // Select the create permission for the user scope
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

		const currentPermissions = form.values.permissions?.filter(permission => permission.scope === scope) || [];

		if (!action) {
			const allActions = Object.keys(availableActions);
			const newPermissions = currentPermissions.length === allActions.length
				? form.values.permissions?.filter(permission => permission.scope !== scope)
				: [
					...(form.values.permissions?.filter(permission => permission.scope !== scope) || []),
					...allActions.map(action => ({ action, scope })),
				];
			updatePermissions(newPermissions as Permission<unknown>[]);
			return;
		}

		const isPermissionPresent = currentPermissions.some(permission => permission.action === action);
		const newPermissions = isPermissionPresent
			? (form.values.permissions?.filter(permission => !(permission.scope === scope && permission.action === action)) || [])
			: [...(form.values.permissions || []), { action, scope }];
		updatePermissions(newPermissions as Permission<unknown>[]);
	};

	//
	// E. Define context value

	const contextValue: UsersDetailContextState = {
		actions: {
			deleteUser: handleDeleteUser,
			handlePermissionChange,
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
	};

	//
	// F. Render components

	return (
		<UsersDetailContext.Provider value={contextValue}>
			{children}
		</UsersDetailContext.Provider>
	);

	//
};

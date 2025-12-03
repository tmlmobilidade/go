'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateUserDto, CreateUserSchema, PermissionSchema, type User } from '@tmlmobilidade/types';
import { UseFormReturnType, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum UsersDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface UserDetailContextState {
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
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: UsersDetailMode
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

	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);

	//
	// B. Fetch data

	const { mutate: allUsersMutate } = useSWR<User[]>(API_ROUTES.auth.USERS_LIST);
	const { data: userData, isLoading: userLoading } = useSWR<User>(userId === 'new' ? null : API_ROUTES.auth.USERS_DETAIL(userId));

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateUserDto>(CreateUserSchema, userData);

	//
	// D. Handle actions

	const handleSaveUser = async () => {
		setIsSaving(true);
		const method = userId === 'new' ? 'POST' : 'PUT';
		const url = userId === 'new' ? API_ROUTES.auth.USERS_LIST : API_ROUTES.auth.USERS_DETAIL(userId);
		const response = await fetchData<User>(url, method, form.getValues());

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

		meContext.mutate.me();
		allUsersMutate();

		setIsSaving(false);
	};

	const handleDeleteUser = async () => {
		// Skip if new user
		if (userId === 'new') return;
		// Confirm deletion
		const response = await fetchData<User>(API_ROUTES.auth.USERS_DETAIL(userId), 'DELETE', userData);
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
	// E. Define context value

	const contextValue: UserDetailContextState = useMemo(() => ({
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
			isReadOnly,
			isSaving,
			loading: userLoading,
			mode: userId === 'new' ? UsersDetailMode.CREATE : UsersDetailMode.EDIT,
		},
	}), [
		form,
		isReadOnly,
		isSaving,
		userId,
		userLoading,
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

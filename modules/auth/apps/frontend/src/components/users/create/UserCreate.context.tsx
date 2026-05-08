'use client';

import { closeCreateUserModal } from '@/components/users/create/UserCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateUserDto, CreateUserSchema, type User } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface UserCreateContextState {
	actions: {
		saveUser: () => void
	}
	data: {
		form: UseFormReturnType<CreateUserDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const UserCreateContext = createContext<undefined | UserCreateContextState>(undefined);

export function useUserCreateContext() {
	const context = useContext(UserCreateContext);
	if (!context) {
		throw new Error('useUserCreateContext must be used within a UserCreateContextProvider');
	}
	return context;
}

/* * */

export const UserCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allUsersMutate } = useSWR<User[]>(API_ROUTES.auth.USERS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateUserDto>(CreateUserSchema);

	//
	// D. Handle actions

	const handleCreateUser = async () => {
		setIsSaving(true);
		const response = await fetchData<User>(API_ROUTES.auth.USERS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar utilizador' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar utilizador' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allUsersMutate();
		setIsSaving(false);
		closeCreateUserModal();
		useToast.success({ message: 'Utilizador criado com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.auth.USERS_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: UserCreateContextState = useMemo(() => ({
		actions: {
			saveUser: handleCreateUser,
		},
		data: {
			form,
		},
		flags: {
			isSaving,
		},
	}), [
		form,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<UserCreateContext.Provider value={contextValue}>
			{children}
		</UserCreateContext.Provider>
	);

	//
};

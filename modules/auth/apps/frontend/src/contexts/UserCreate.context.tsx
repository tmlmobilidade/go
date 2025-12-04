'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateUserDto, CreateUserSchema, type User } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
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
	const [isReadOnly] = useState(false);
	const [modalState, setModalState] = useState(false);

	//
	// B. Fetch data

	const { mutate: allUsersMutate } = useSWR<User[]>(API_ROUTES.auth.USERS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateUserDto>(CreateUserSchema);

	//
	// D. Handle actions

	const handleSaveUser = async () => {
		setIsSaving(true);
		const response = await fetchData<User>(API_ROUTES.auth.USERS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao salvar utilizador' });
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({ message: error.message, title: 'Erro ao salvar utilizador' });
				}
			}
			setIsSaving(false);
			return;
		}
		form.resetDirty();
		console.log('response', response);
		useToast.success({ message: 'Utilizador salvo com sucesso', title: 'Sucesso' });
		if (response.data?._id) {
			router.replace(PAGE_ROUTES.auth.USERS_DETAIL(response.data._id));
		}
		allUsersMutate();
		setIsSaving(false);
	};

	//
	// E. Define context value

	const contextValue: UserCreateContextState = useMemo(() => ({
		actions: {
			saveUser: handleSaveUser,
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
		<UserCreateContext.Provider value={contextValue}>
			{children}
		</UserCreateContext.Provider>
	);

	//
};

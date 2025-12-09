'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateRoleDto, CreateRoleSchema, Role } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface RoleCreateContextState {
	actions: {
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
		form.setFieldValue('permissions', []);
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

	//
	// E. Define context value

	const contextValue: RoleCreateContextState = useMemo(() => ({
		actions: {
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

'use client';

/* * */

import { closeCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateRoleDto, CreateRoleSchema, Role } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';
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
		isSaving: boolean
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

	//
	// B. Fetch data

	const { mutate: allRolesMutate } = useSWR<Role[]>(API_ROUTES.auth.ROLES_LIST);

	//
	// C. Setup form

	const { formRef } = useTypicalForm<CreateRoleDto>(CreateRoleSchema);

	//
	// D. Handle actions

	const handleCreateRole = async () => {
		setIsSaving(true);
		const response = await fetchData<Role>(API_ROUTES.auth.ROLES_LIST, 'POST', formRef.current.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar grupo de permissões' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar grupo de permissões' });
			}
			setIsSaving(false);
			return;
		}
		formRef.current.reset();
		allRolesMutate();
		setIsSaving(false);
		closeCreateRoleModal();
		useToast.success({ message: 'Grupo de permissões criado com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.auth.ROLES_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: RoleCreateContextState = {
		actions: {
			saveRole: handleCreateRole,
		},
		data: {
			form: formRef.current,
		},
		flags: {
			isSaving,
		},
	};

	//
	// F. Render components

	return (
		<RoleCreateContext.Provider value={contextValue}>
			{children}
		</RoleCreateContext.Provider>
	);

	//
};

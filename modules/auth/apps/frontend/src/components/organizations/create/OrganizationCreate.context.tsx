'use client';

import { closeCreateOrganizationModal } from '@/components/organizations/create/OrganizationCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateOrganizationDto, CreateOrganizationSchema, Organization } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface OrganizationCreateContextState {
	actions: {
		saveOrganization: () => void
	}
	data: {
		form: UseFormReturnType<CreateOrganizationDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const OrganizationCreateContext = createContext<OrganizationCreateContextState | undefined>(undefined);

export function useOrganizationCreateContext() {
	const context = useContext(OrganizationCreateContext);
	if (!context) {
		throw new Error('useOrganizationCreateContext must be used within a OrganizationCreateContextProvider');
	}
	return context;
}

/* * */

export const OrganizationCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allOrganizationsMutate } = useSWR<Organization[]>(API_ROUTES.auth.ORGANIZATIONS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateOrganizationDto>(CreateOrganizationSchema);

	//
	// D. Handle actions

	const handleCreateOrganization = async () => {
		setIsSaving(true);
		const response = await fetchData<Organization>(API_ROUTES.auth.ORGANIZATIONS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar organização' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar organização' });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allOrganizationsMutate();
		setIsSaving(false);
		closeCreateOrganizationModal();
		useToast.success({ message: 'Organização criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: OrganizationCreateContextState = useMemo(() => ({
		actions: {
			saveOrganization: handleCreateOrganization,
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
		<OrganizationCreateContext.Provider value={contextValue}>
			{children}
		</OrganizationCreateContext.Provider>
	);

	//
};

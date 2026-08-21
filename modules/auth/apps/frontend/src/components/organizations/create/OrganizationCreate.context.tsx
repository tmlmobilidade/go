'use client';

import { closeCreateOrganizationModal } from '@/components/organizations/create/OrganizationCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateOrganizationDto, CreateOrganizationSchema, type Organization } from '@tmlmobilidade/go-types-core';
import { fetchApiData, keepUrlParams, UseFormReturnType, useHandleUpdate, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
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

	//
	// B. Fetch data

	const { mutate: allOrganizationsMutate } = useSWR<Organization[]>(API_ROUTES.auth.ORGANIZATIONS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateOrganizationDto>(CreateOrganizationSchema);

	//
	// D. Handle actions

	const { action: saveOrganization, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'POST', url: API_ROUTES.auth.ORGANIZATIONS_LIST }),
		onSuccess: ({ data }) => {
			form.reset();
			allOrganizationsMutate();
			closeCreateOrganizationModal();
			useToast.success({ message: 'Organização criada com sucesso', title: 'Sucesso' });
			if (data?._id) router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_DETAIL(data._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: OrganizationCreateContextState = useMemo(() => ({
		actions: {
			saveOrganization,
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

'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateOrganizationDto, CreateOrganizationSchema, Organization } from '@tmlmobilidade/types';
import { UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
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
	const [isReadOnly] = useState(false);
	const [modalState, setModalState] = useState(false);

	//
	// B. Fetch data

	const { mutate: allOrganizationsMutate } = useSWR<Organization[]>(API_ROUTES.auth.ORGANIZATIONS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateOrganizationDto>(CreateOrganizationSchema);

	//
	// D. Handle actions

	const handleSaveOrganization = async () => {
		setIsSaving(true);
		const url = API_ROUTES.auth.ORGANIZATIONS_LIST;
		const body = form.getValues();
		const response = await fetchData<Organization>(url, 'POST', body);

		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({
					message: response.error,
					title: 'Erro ao salvar organização',
				});
			}
			else {
				const errors = JSON.parse(response.error);
				for (const error of errors) {
					useToast.error({
						message: error.message,
						title: 'Erro ao salvar organização',
					});
				}
			}

			form.resetDirty();
			console.log('response', response);
			useToast.success({ message: 'Utilizador salvo com sucesso', title: 'Sucesso' });
			if (response.data?._id) {
				router.replace(PAGE_ROUTES.auth.USERS_DETAIL(response.data._id));
			}
			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Organização salva com sucesso',
			title: 'Sucesso',
		});

		form.resetDirty();
		allOrganizationsMutate();
		setIsSaving(false);
	};

	//
	// E. Define context value

	const contextValue: OrganizationCreateContextState = useMemo(() => ({
		actions: {
			saveOrganization: handleSaveOrganization,
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
		<OrganizationCreateContext.Provider value={contextValue}>
			{children}
		</OrganizationCreateContext.Provider>
	);

	//
};

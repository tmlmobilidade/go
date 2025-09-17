'use client';

/* * */

import { Routes } from '@/lib/routes';
import { CreateOrganizationDto, CreateOrganizationSchema, HomeLink, Organization, UpdateOrganizationSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum OrganizationsDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface OrganizationsDetailContextState {
	actions: {
		deleteOrganization: () => void
		saveOrganization: () => void
		setValidationFile: (file: File | null) => void
	}
	data: {
		form: UseFormReturnType<CreateOrganizationDto>
		home_links: HomeLink[]
		id: string | undefined
		organization: Organization
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: OrganizationsDetailMode
	}
}

const emptyOrganization: CreateOrganizationDto = {
	home_links: [],
	home_wikis: [],
	logo: '',
	long_name: '',
	short_name: '',
	theme: '',
};

/* * */

const OrganizationsDetailContext = createContext<OrganizationsDetailContextState | undefined>(undefined);

export function useOrganizationsDetailContext() {
	const context = useContext(OrganizationsDetailContext);
	if (!context) {
		throw new Error('useOrganizationsDetailContext must be used within a OrganizationsDetailContextProvider');
	}
	return context;
}

/* * */

export const OrganizationsDetailContextProvider = ({ children, organization_id }: { children: React.ReactNode, organization_id: string }) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [validationFile, setValidationFile] = useState<File | null>(null); // FINISH FILE UPLOAD

	//
	// B. Fetch data

	const { data: organization, isLoading } = useSWR<Organization>(organization_id === 'new' ? null : Routes.AUTH_API + Routes.ORGANIZATION_DETAIL(organization_id));

	//
	// C. Initialize form

	const form = useForm<CreateOrganizationDto>({
		initialValues: emptyOrganization,
		validate: zodResolver(CreateOrganizationSchema) as unknown as FormValidateInput<CreateOrganizationDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!organization) return;
		setLoading(true);
		form.initialize(convertObject(organization, CreateOrganizationSchema));
		setLoading(false);
	}, [organization]);

	//
	// C. Transform Data

	// Update the home links ref to the most recent one
	const prevHomeLinksRef = useRef<HomeLink[]>(form.values.home_links);
	useEffect(() => {
		const prev = prevHomeLinksRef.current;
		const curr = form.values.home_links;
		if (prev.length > curr.length) {
			// A link was deleted
			handleSaveOrganization();
		}
		prevHomeLinksRef.current = curr;
	}, [form.values.home_links]);

	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Handle actions

	const handleSaveOrganization = async () => {
		setIsSaving(true);
		const method = organization_id === 'new' ? 'POST' : 'PUT';
		const url = organization_id === 'new' ? Routes.API(Routes.ORGANIZATION_LIST) : Routes.API(Routes.ORGANIZATION_DETAIL(organization_id));
		const body = organization_id === 'new' ? form.values : convertObject(form.values, UpdateOrganizationSchema);
		const response = await fetchData<Organization>(url, method, body);

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

			setIsSaving(false);
			return;
		}

		useToast.success({
			message: 'Organização salva com sucesso',
			title: 'Sucesso',
		});

		if (organization_id === 'new' && response.data?._id) {
			router.replace(Routes.ORGANIZATION_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteOrganization = async () => {
		if (organization_id === 'new') return;

		const response = await fetchData<Organization>(Routes.AUTH_API + Routes.ORGANIZATION_DETAIL(organization_id), 'DELETE', organization);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar organização',
				});
			}
			return;
		}

		useToast.success({
			message: 'Organização apagada com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.ORGANIZATION_LIST);
	};

	//
	// E. Define context value

	const contextValue: OrganizationsDetailContextState = useMemo(() => ({
		actions: {
			deleteOrganization: handleDeleteOrganization,
			saveOrganization: handleSaveOrganization,
			setValidationFile,
		},
		data: {
			form,
			home_links: form.values.home_links,
			id: organization_id === 'new' ? undefined : organization_id,
			organization: organization,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: organization_id === 'new' ? OrganizationsDetailMode.CREATE : OrganizationsDetailMode.EDIT,
		},
	}), [form, handleDeleteOrganization, handleSaveOrganization, isLoading, isReadOnly, isSaving, loading, organization_id]);

	//
	// F. Render components

	return (
		<OrganizationsDetailContext.Provider value={contextValue}>
			{children}
		</OrganizationsDetailContext.Provider>
	);

	//
};

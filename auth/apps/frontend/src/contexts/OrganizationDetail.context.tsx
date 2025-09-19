'use client';

/* * */

import { Routes } from '@/lib/routes';
import { CreateOrganizationDto, CreateOrganizationSchema, Organization, UpdateOrganizationSchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { convertObject } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export enum OrganizationsDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

interface OrganizationsDetailContextState {
	actions: {
		deleteImage: (theme: 'dark' | 'light') => void
		deleteOrganization: () => void
		fileChangedDark: (file: File) => void
		fileChangedLight: (file: File) => void
		saveOrganization: () => void
	}
	data: {
		form: UseFormReturnType<CreateOrganizationDto>
		id: string | undefined
		logoDarkUrl: null | string
		logoLightUrl: null | string
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
	logo_dark: '',
	logo_light: '',
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
	const [imageDark, setImageDark] = useState<File | null>(null);
	const [imageLight, setImageLight] = useState<File | null>(null);

	//
	// B. Fetch data

	const orgDetailKey = organization_id === 'new' ? null : Routes.AUTH_API + Routes.ORGANIZATION_DETAIL(organization_id);
	const orgLogoKey = organization_id === 'new' ? null : Routes.AUTH_API + Routes.ORGANIZATION_LOGO(organization_id);
	const { data: organization, isLoading, mutate } = useSWR<Organization>(orgDetailKey);
	const { data: logo, isLoading: isLogoLoading } = useSWR<{ logo_dark: null | string, logo_light: null | string }>(orgLogoKey);

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

	// C. Transform Data

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

		if (response.data) await uploadImages(response.data._id.toString());

		useToast.success({
			message: 'Organização salva com sucesso',
			title: 'Sucesso',
		});

		if (orgDetailKey) {
			mutate();
		}

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

	const uploadImages = async (organization_id: string) => {
		const imagesToUpload: { dark?: File, light?: File } = {};

		if (imageLight) {
			imagesToUpload.light = imageLight;
		}

		if (imageDark) {
			imagesToUpload.dark = imageDark;
		}

		if (Object.keys(imagesToUpload).length === 0) return;

		const formData = new FormData();

		if (imagesToUpload.dark) {
			formData.append('dark', imagesToUpload.dark);
		}

		if (imagesToUpload.light) {
			formData.append('light', imagesToUpload.light);
		}

		const response = await fetch(Routes.AUTH_API + Routes.ORGANIZATION_IMAGE_NO_THEME(organization_id), {
			body: formData,
			method: 'POST',
		});

		const result = await response.json();

		if (response.ok) {
			useToast.success({ message: 'As imagens foram carregadas com sucesso', title: 'Sucesso' });
		}
		else {
			useToast.error({ message: result.error || 'Erro ao carregar imagens', title: 'Erro' });
		}
	};

	const deleteImage = async (theme: 'dark' | 'light') => {
		const response = await fetchData<Organization>(Routes.AUTH_API + Routes.ORGANIZATION_IMAGE(organization_id, theme) + '?realtime=true', 'DELETE', organization);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao apagar imagem' });
			}
			return;
		}

		useToast.success({ message: 'Imagem apagada com sucesso', title: 'Sucesso' });
	};

	//
	// E. Define context value

	const contextValue: OrganizationsDetailContextState = useMemo(() => ({
		actions: {
			deleteImage: deleteImage,
			deleteOrganization: handleDeleteOrganization,
			fileChangedDark: (file: File) => setImageDark(file),
			fileChangedLight: (file: File) => setImageLight(file),
			saveOrganization: handleSaveOrganization,
		},
		data: {
			form,
			id: organization_id === 'new' ? undefined : organization_id,
			logoDarkUrl: logo?.logo_dark,
			logoLightUrl: logo?.logo_light,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: organization_id === 'new' ? OrganizationsDetailMode.CREATE : OrganizationsDetailMode.EDIT,
		},
	}), [form, handleDeleteOrganization, handleSaveOrganization, isLoading, isLogoLoading, isReadOnly, isSaving, loading, organization_id]);

	//
	// F. Render components

	return (
		<OrganizationsDetailContext.Provider value={contextValue}>
			{children}
		</OrganizationsDetailContext.Provider>
	);

	//
};

'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateOrganizationSchema, type Organization, PermissionCatalog, type UpdateOrganizationDto } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import useSWR from 'swr';

/* * */

interface OrganizationsDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		deleteImage: (theme: 'dark' | 'light') => void
		fileChangedDark: (file: File) => void
		fileChangedLight: (file: File) => void
	}
	data: {
		form: UseFormReturnType<UpdateOrganizationDto>
		id: string | undefined
		logoDarkUrl: null | string
		logoLightUrl: null | string
		organization?: Organization
	}
}

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

export const OrganizationsDetailContextProvider = ({ children, organizationId }: PropsWithChildren<{ organizationId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	const [imageDark, setImageDark] = useState<File | null>(null);
	const [imageLight, setImageLight] = useState<File | null>(null);

	//
	// B. Fetch data

	const { mutate: allOrganizationsMutate } = useSWR<Organization[]>(API_ROUTES.auth.ORGANIZATIONS_LIST);
	const { data: organizationData, error: organizationError, isLoading: organizationLoading, mutate: organizationMutate } = useSWR<Organization>(organizationId && API_ROUTES.auth.ORGANIZATIONS_DETAIL(organizationId));
	const { data: logo, isLoading: isLogoLoading } = useSWR<{ logo_dark: null | string, logo_light: null | string }>(organizationId && API_ROUTES.auth.ORGANIZATIONS_DETAIL_LOGO(organizationId));

	//
	// C. Initialize form

	const { formRef } = useTypicalForm<UpdateOrganizationDto>(CreateOrganizationSchema, organizationData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Organization>(API_ROUTES.auth.ORGANIZATIONS_DETAIL(organizationId), 'PUT', formRef.current.getValues()),
		onSuccess: async (updatedItem) => {
			await uploadImages();
			formRef.current.resetDirty();
			meContext.mutate.me();
			organizationMutate(updatedItem);
			allOrganizationsMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Organization>(API_ROUTES.auth.ORGANIZATIONS_DETAIL(organizationId), 'DELETE'),
		onSuccess: () => {
			meContext.mutate.me();
			allOrganizationsMutate();
			router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Organization>(API_ROUTES.auth.ORGANIZATIONS_DETAIL_LOCK(organizationId)),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			meContext.mutate.me();
			organizationMutate(updatedItem);
			allOrganizationsMutate();
		},
	});

	const uploadImages = async () => {
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

		const response = await fetch(API_ROUTES.auth.ORGANIZATIONS_DETAIL_IMAGE(organizationId), {
			body: formData,
			method: 'POST',
		});

		const result = await response.json();

		if (response.ok) {
			useToast.success({ message: 'As imagens foram carregadas com sucesso', title: 'Sucesso' });
		} else {
			useToast.error({ message: result.error || 'Erro ao carregar imagens', title: 'Erro' });
		}
	};

	const deleteImage = async (theme: 'dark' | 'light') => {
		const themeImageRoute = API_ROUTES.auth.ORGANIZATIONS_DETAIL_VAR_IMAGE(organizationId, theme);
		const response = await fetchData<Organization>(themeImageRoute + '?realtime=true', 'DELETE', organizationData);
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
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isLoading: organizationLoading,
		isLocked: organizationData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: organizationLoading,
		isLocked: organizationData?.is_locked,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: organizationLoading,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: organizationLoading,
		isLocked: organizationData?.is_locked,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	//
	// F. Define context value

	const contextValue: OrganizationsDetailContextState = {
		actions: {
			delete: handleDelete,
			deleteImage: deleteImage,
			fileChangedDark: (file: File) => setImageDark(file),
			fileChangedLight: (file: File) => setImageLight(file),
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form: formRef.current,
			id: organizationId,
			logoDarkUrl: logo?.logo_dark,
			logoLightUrl: logo?.logo_light,
			organization: organizationData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: organizationError,
			isDeleting,
			isLoading: organizationLoading || isLogoLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
	};

	//
	// G. Render components

	return (
		<OrganizationsDetailContext.Provider value={contextValue}>
			{children}
		</OrganizationsDetailContext.Provider>
	);

	//
};

'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateOrganizationSchema, type Organization, type UpdateOrganizationDto } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type DetailContextStateTemplate, fetchApiData, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
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
	const { data: logo, isLoading: isLogoLoading } = useSWR<{ logo_dark: null | string, logo_light: null | string }>(organizationId && API_ROUTES.auth.ORGANIZATIONS_DETAIL_IMAGE(organizationId));

	//
	// C. Initialize form

	const { form } = useTypicalForm<UpdateOrganizationDto>(CreateOrganizationSchema, organizationData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.auth.ORGANIZATIONS_DETAIL(organizationId) }),
		onSuccess: async ({ data }) => {
			await uploadImages();
			form.resetDirty();
			meContext.mutate.me();
			organizationMutate(data);
			allOrganizationsMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'DELETE', url: API_ROUTES.auth.ORGANIZATIONS_DETAIL(organizationId) }),
		onSuccess: () => {
			meContext.mutate.me();
			allOrganizationsMutate();
			router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ url: API_ROUTES.auth.ORGANIZATIONS_DETAIL_LOCK(organizationId) }),
		onSuccess: ({ data }) => {
			form.resetDirty();
			meContext.mutate.me();
			organizationMutate(data);
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
			credentials: 'include',
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
		const response = await fetchApiData<Organization>({ method: 'DELETE', url: themeImageRoute + '?realtime=true' });
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
		isDirty: form.isDirty(),
		isLoading: organizationLoading,
		isLocked: organizationData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: organizationLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: organizationLoading,
		isLocked: organizationData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// F. Define context value

	const contextValue: OrganizationsDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			deleteImage: deleteImage,
			fileChangedDark: (file: File) => setImageDark(file),
			fileChangedLight: (file: File) => setImageLight(file),
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
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
	}), [
		canDelete,
		canLock,
		canSave,
		organizationError,
		isDeleting,
		organizationLoading,
		isLocking,
		isReadOnly,
		isSaving,
		form,
		organizationData,
		organizationId,
	]);

	//
	// G. Render components

	return (
		<OrganizationsDetailContext.Provider value={contextValue}>
			{children}
		</OrganizationsDetailContext.Provider>
	);

	//
};

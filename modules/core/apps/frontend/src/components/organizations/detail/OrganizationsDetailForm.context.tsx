'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Organization, type UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiMultipart, type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useOrganizationsListData } from '../list/use-organizations-list-data';
import { useOrganizationsDetailData } from './use-organizations-detail-data';
import { useOrganizationsDetailOrganizationId } from './use-organizations-detail-organization-id';
import { useOrganizationsImageDetailData } from './use-organizations-image-detail-data';

/* * */

interface OrganizationsDetailFormContextValue extends StandardFormContextValue<UpdateOrganizationDto> {
	actions: StandardFormContextValue<UpdateOrganizationDto>['actions'] & {
		deleteDarkLogo: () => void
		deleteLightLogo: () => void
		updateDarkLogo: (imageFile: File) => void
		updateLightLogo: (imageFile: File) => void
	}
	status: StandardFormContextValue<UpdateOrganizationDto>['status'] & {
		isDeletingDarkLogo: boolean
		isDeletingLightLogo: boolean
		isUpdatingDarkLogo: boolean
		isUpdatingLightLogo: boolean
	}
}

/* * */

const OrganizationsDetailFormContext = createContext<OrganizationsDetailFormContextValue | undefined>(undefined);

export function useOrganizationsDetailFormContext() {
	const context = useContext(OrganizationsDetailFormContext);
	if (!context) throw new Error('useOrganizationsDetailFormContext must be used within a OrganizationsDetailFormContextProvider');
	return context;
}

/* * */

export function OrganizationsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { organizationId } = useOrganizationsDetailOrganizationId();

	const { data: meData } = useMeData();

	const { mutate: organizationsListMutate } = useOrganizationsListData();

	const { data: organizationData, isLoading: organizationDataLoading, mutate: organizationsDetailMutate } = useOrganizationsDetailData();

	const { mutate: organizationsImageDetailLightMutate } = useOrganizationsImageDetailData('light');
	const { mutate: organizationsImageDetailDarkMutate } = useOrganizationsImageDetailData('dark');

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateOrganizationDto, typeof UpdateOrganizationSchema>({
		apiData: organizationData,
		schema: UpdateOrganizationSchema,
	});

	//
	// D. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.ORGANIZATIONS_DETAIL_UPDATE(organizationId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			organizationsDetailMutate();
			organizationsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'DELETE', url: API_ROUTES.core.ORGANIZATIONS_DETAIL_DELETE(organizationId) }),
		onSuccess: () => {
			organizationsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'PUT', url: API_ROUTES.core.ORGANIZATIONS_DETAIL_LOCK(organizationId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			organizationsDetailMutate();
			organizationsListMutate();
		},
	});

	const { action: handleDeleteLightLogo, isLoading: isDeletingLightLogo } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'DELETE', url: API_ROUTES.core.ORGANIZATIONS_DETAIL_DELETE_IMAGE_VAR(organizationId, 'light') }),
		onSuccess: () => {
			organizationsImageDetailLightMutate();
		},
	});

	const { action: handleDeleteDarkLogo, isLoading: isDeletingDarkLogo } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'DELETE', url: API_ROUTES.core.ORGANIZATIONS_DETAIL_DELETE_IMAGE_VAR(organizationId, 'dark') }),
		onSuccess: () => {
			organizationsImageDetailDarkMutate();
		},
	});

	const { action: handleUpdateLightLogo, isLoading: isUpdatingLightLogo } = useHandleUpdate({
		fetchFn: async (imageFile: File) => {
			const formData = new FormData();
			formData.append('light', imageFile);
			return await fetchApiMultipart<Organization>(API_ROUTES.core.ORGANIZATIONS_DETAIL_UPDATE_IMAGE(organizationId), formData);
		},
		onSuccess: () => {
			organizationsImageDetailLightMutate();
		},
	});

	const { action: handleUpdateDarkLogo, isLoading: isUpdatingDarkLogo } = useHandleUpdate({
		fetchFn: async (imageFile: File) => {
			const formData = new FormData();
			formData.append('dark', imageFile);
			return await fetchApiMultipart<Organization>(API_ROUTES.core.ORGANIZATIONS_DETAIL_UPDATE_IMAGE(organizationId), formData);
		},
		onSuccess: () => {
			organizationsImageDetailDarkMutate();
		},
	});

	//
	// C. Setup flags

	const hasDeletePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'delete',
			scope: 'organizations',
		});
	}, [meData?.permissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'organizations',
		});
	}, [meData?.permissions]);

	const { deleteEnabled, editEnabled, lockEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: organizationDataLoading,
		},
		locked: {
			hasPermission: hasUpdatePermission,
			isLocked: organizationData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating || isUpdatingDarkLogo || isUpdatingLightLogo,
		},
	});

	//
	// E. Return state

	const stateValue: OrganizationsDetailFormContextValue = useMemo(() => ({
		actions: {
			delete: handleDelete,
			deleteDarkLogo: handleDeleteDarkLogo,
			deleteLightLogo: handleDeleteLightLogo,
			lock: handleLock,
			update: handleUpdate,
			updateDarkLogo: handleUpdateDarkLogo,
			updateLightLogo: handleUpdateLightLogo,
		},
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isDeletingDarkLogo,
			isDeletingLightLogo,
			isLoading: organizationDataLoading,
			isLocked: organizationData?.is_locked,
			isLocking,
			isUpdating,
			isUpdatingDarkLogo,
			isUpdatingLightLogo,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleDeleteDarkLogo, handleDeleteLightLogo, handleLock, handleUpdate, handleUpdateDarkLogo, handleUpdateLightLogo, isDeleting, isDeletingDarkLogo, isDeletingLightLogo, isDirty, isLocking, isUpdating, isUpdatingDarkLogo, isUpdatingLightLogo, lockEnabled, organizationData?.is_locked, organizationDataLoading, unblock, updateEnabled, isValid]);

	return (
		<OrganizationsDetailFormContext.Provider value={stateValue}>
			{children}
		</OrganizationsDetailFormContext.Provider>
	);
}

'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Organization, type UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useOrganizationsListData } from '../list/use-organizations-list-data';
import { useOrganizationsDetailData } from './use-organizations-detail-data';
import { useOrganizationsDetailOrganizationId } from './use-organizations-detail-organization-id';

/* * */

const OrganizationsDetailFormContext = createContext<StandardFormContextValue<UpdateOrganizationDto> | undefined>(undefined);

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

	//
	// B. Setup form

	const { form, unblock } = useStandardForm<UpdateOrganizationDto, typeof UpdateOrganizationSchema>({
		apiData: organizationData,
		schema: UpdateOrganizationSchema,
	});

	//
	// D. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.ROLES_UPDATE(organizationId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			organizationsDetailMutate();
			organizationsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'DELETE', url: API_ROUTES.core.ROLES_DELETE(organizationId) }),
		onSuccess: () => {
			organizationsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ method: 'PUT', url: API_ROUTES.core.ROLES_DETAIL(organizationId) }),
		onSuccess: ({ data }) => {
			form.reset(data);
			organizationsDetailMutate();
			organizationsListMutate();
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
			isDirty: form.formState.isDirty,
			isValid: form.formState.isValid,
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
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateOrganizationDto> = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		status: {
			isDeleting,
			isLoading: organizationDataLoading,
			isLocked: organizationData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isLocking, isUpdating, lockEnabled, organizationData?.is_locked, organizationDataLoading, unblock, updateEnabled]);

	return (
		<OrganizationsDetailFormContext.Provider value={stateValue}>
			{children}
		</OrganizationsDetailFormContext.Provider>
	);
}

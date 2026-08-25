'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateOrganizationDto, CreateOrganizationSchema, Organization } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleUpdate, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useOrganizationsListData } from '../list/use-organizations-list-data';
import { closeOrganizationsCreateModal } from './OrganizationsCreate.modal';

/* * */

const OrganizationsCreateFormContext = createContext<StandardFormContextValue<CreateOrganizationDto> | undefined>(undefined);

export function useOrganizationsCreateFormContext() {
	const context = useContext(OrganizationsCreateFormContext);
	if (!context) throw new Error('useOrganizationsCreateFormContext must be used within a OrganizationsCreateFormContextProvider');
	return context;
}

/* * */

export function OrganizationsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate } = useOrganizationsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateOrganizationDto, typeof CreateOrganizationSchema>({
		schema: CreateOrganizationSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'POST', url: API_ROUTES.core.ORGANIZATIONS_CREATE }),
		onSuccess: ({ data }) => {
			closeOrganizationsCreateModal();
			form.reset();
			unblock();
			mutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_DETAIL(data._id)));
		},
	});

	//
	// C. Setup flags

	const hasCreatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'create',
			scope: 'organizations',
		});
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// D. Return context value

	const stateValue: StandardFormContextValue<CreateOrganizationDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, unblock, isDirty, isValid]);

	return (
		<OrganizationsCreateFormContext.Provider value={stateValue}>
			{children}
		</OrganizationsCreateFormContext.Provider>
	);
}

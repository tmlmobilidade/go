'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateRoleDto, CreateRoleSchema, Role } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleUpdate, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRolesListData } from '../list/use-roles-list-data';
import { closeRolesCreateModal } from './RolesCreate.modal';

/* * */

const RolesCreateFormContext = createContext<StandardFormContextValue<CreateRoleDto> | undefined>(undefined);

export function useRolesCreateFormContext() {
	const context = useContext(RolesCreateFormContext);
	if (!context) throw new Error('useRolesCreateFormContext must be used within a RolesCreateFormContextProvider');
	return context;
}

/* * */

export function RolesCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate } = useRolesListData();

	//
	// B. Setup form

	const { form, unblock } = useStandardForm<CreateRoleDto, typeof CreateRoleSchema>({
		schema: CreateRoleSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ body: form.getValues(), method: 'POST', url: API_ROUTES.core.ROLES_CREATE }),
		onSuccess: ({ data }) => {
			closeRolesCreateModal();
			form.reset();
			unblock();
			mutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_DETAIL(data._id)));
		},
	});

	//
	// C. Setup flags

	const hasCreatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'create',
			scope: 'roles',
		});
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreating,
		},
		form: {
			isDirty: form.formState.isDirty,
			isValid: form.formState.isValid,
		},
	});

	//
	// D. Return context value

	const stateValue: StandardFormContextValue<CreateRoleDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, unblock]);

	return (
		<RolesCreateFormContext.Provider value={stateValue}>
			{children}
		</RolesCreateFormContext.Provider>
	);
}

'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateUserDto, CreateUserSchema, User } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useUsersListData } from '../list/use-users-list-data';
import { closeUsersCreateModal } from './UsersCreate.modal';

/* * */

const UsersCreateFormContext = createContext<StandardFormContextValue<CreateUserDto> | undefined>(undefined);

export function useUsersCreateFormContext() {
	const context = useContext(UsersCreateFormContext);
	if (!context) throw new Error('useUsersCreateFormContext must be used within a UsersCreateFormContextProvider');
	return context;
}

/* * */

export function UsersCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate } = useUsersListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateUserDto, typeof CreateUserSchema>({
		schema: CreateUserSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<User>({ body: form.getValues(), method: 'POST', url: API_ROUTES.core.USERS_CREATE }),
		onSuccess: ({ data }) => {
			closeUsersCreateModal();
			form.reset();
			unblock();
			mutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.core.USERS_DETAIL(data._id)));
		},
	});

	//
	// C. Setup flags

	const hasCreatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'create',
			scope: 'users',
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

	const stateValue: StandardFormContextValue<CreateUserDto> = useMemo(() => ({
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
		<UsersCreateFormContext.Provider value={stateValue}>
			{children}
		</UsersCreateFormContext.Provider>
	);
}

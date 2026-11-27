'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UsersUpdateItemRequest, UsersUpdateItemRequestSchema, type UsersUpdateItemResponse } from '@tmlmobilidade/go-core-pckg-types';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMePermissions, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, keepUrlParams, useHandleAction } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useUsersListData } from '../list/use-users-list-data';
import { useUsersDetailData } from './use-users-detail-data';
import { useUsersDetailUserId } from './use-users-detail-user-id';

/* * */

const UsersDetailFormContext = createContext<StandardFormContextValue<UsersUpdateItemRequest> | undefined>(undefined);

export function useUsersDetailFormContext() {
	const context = useContext(UsersDetailFormContext);
	if (!context) throw new Error('useUsersDetailFormContext must be used within a UsersDetailFormContextProvider');
	return context;
}

/* * */

export function UsersDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { userId } = useUsersDetailUserId();

	const { data: mePermissions } = useMePermissions();

	const { mutate: usersListMutate } = useUsersListData();

	const { data: userData, isLoading: userDataLoading, mutate: usersDetailMutate } = useUsersDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UsersUpdateItemRequest, typeof UsersUpdateItemRequestSchema>({
		apiData: userData,
		schema: UsersUpdateItemRequestSchema,
	});

	//
	// D. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<UsersUpdateItemResponse>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.USERS_UPDATE(userId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			usersDetailMutate(response);
			usersListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.core.USERS_DELETE(userId) }),
		onSuccess: () => {
			usersListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.USERS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'PUT', url: API_ROUTES.core.USERS_LOCK(userId) }),
		onSuccess: () => {
			usersListMutate();
		},
	});

	//
	// C. Setup flags

	const hasDeletePermission = useMemo(() => {
		return hasPermission(mePermissions, {
			action: 'delete',
			scope: 'users',
		});
	}, [mePermissions]);

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(mePermissions, {
			action: 'update',
			scope: 'users',
		});
	}, [mePermissions]);

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
			isLoading: userDataLoading,
		},
		locked: {
			hasPermission: hasUpdatePermission,
			isLocked: userData?.is_locked ?? false,
			isLocking: isLocking,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UsersUpdateItemRequest> = useMemo(() => ({
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
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading: userDataLoading,
			isLocked: userData?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [deleteEnabled, editEnabled, form, handleDelete, handleLock, handleUpdate, isDeleting, isLocking, isUpdating, lockEnabled, userData?.is_locked, userDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<UsersDetailFormContext.Provider value={stateValue}>
			{children}
		</UsersDetailFormContext.Provider>
	);
}

'use client';

/* * */

import { API_ROUTES, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { FileExport, PermissionCatalog, type User, type UserPreferenceValue } from '@tmlmobilidade/types';
import { fetchData, type HasPermissionResourceArgs, hasPermissionResource as hasPermissionResourceUtils } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { ErrorDisplay } from '../components/display/ErrorDisplay';
import { LoadingOverlay } from '../components/loaders/LoadingOverlay';

/* * */

interface MeContextState {
	actions: {
		getPreference: <T extends UserPreferenceValue>(scope: string, key: string) => T | undefined
		hasPermission: (scope: string, action: string) => boolean
		hasPermissionResource: (args: HasPermissionResourceArgs) => boolean
		logout: () => Promise<void>
		updatePreference: (scope: string, key: string, value: undefined | UserPreferenceValue) => Promise<void>
	}
	data: {
		fileExports: FileExport[]
		user: undefined | User
	}
	flags: {
		error?: HttpException
		loading: boolean
	}
	mutate: {
		fileExports: () => void
		me: () => void
	}
}

/* * */

const MeContext = createContext<MeContextState | undefined>(undefined);

export function useMeContext() {
	const context = useContext(MeContext);
	if (!context) throw new Error('useMeContext must be used within a MeContextProvider');
	return context;
}

/* * */

export const MeContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// B. Fetch data

	const { data: meData, error: meError, isLoading: meLoading, mutate: meMutate } = useSWR<User, HttpException>(API_ROUTES.auth.USERS_ME, { refreshInterval: 15_000 });
	const { data: fileExportsData, error: fileExportsError, isLoading: fileExportsLoading, mutate: fileExportsMutate } = useSWR<FileExport[], HttpException>(API_ROUTES.exporter.EXPORTER_LIST, { refreshInterval: 5_000 });

	//
	// B. Handle actions

	useEffect(() => {
		// Skip if data is still loading
		if (meLoading) return;
		// If a user is not available redirect to login page
		if (!meData) window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	}, [meLoading, meData]);

	function hasPermission(scope: string, action: string) {
		if (!meData || !meData.permissions) return false;
		return PermissionCatalog.hasPermission(meData.permissions, scope, action);
	}

	function hasPermissionResource(args: HasPermissionResourceArgs) {
		if (!meData || !meData.permissions) return false;
		return hasPermissionResourceUtils({ ...args, permissions: meData.permissions });
	}

	async function logout() {
		// Call the logout endpoint
		await fetch(API_ROUTES.auth.AUTH_LOGOUT, { credentials: 'include' });
		// Mutate the SWR cache to remove user data
		meMutate(undefined, { revalidate: true });
		// Redirect to login page
		window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	}

	function getPreference<T extends UserPreferenceValue>(scope: string, key: string): T | undefined {
		return meData?.preferences?.[scope]?.[key] as T | undefined;
	}

	async function updatePreference(scope: string, key: string, value: undefined | UserPreferenceValue) {
		// Skip if user data is not available
		if (!meData) return;
		// Merge current with updated preferences
		const currentPreferences = meData.preferences ?? {};
		const currentScope = currentPreferences[scope] ?? {};
		const updatedScope = { ...currentScope, [key]: value };
		const updatedPreferences = { ...currentPreferences, [scope]: updatedScope };
		// Call the update endpoint
		await fetchData(API_ROUTES.auth.USERS_ME, 'PUT', { preferences: updatedPreferences });
		// Mutate the SWR cache to update user data
		meMutate();
	}

	//
	// C. Define context value

	const contextValue: MeContextState = useMemo(() => ({
		actions: {
			getPreference,
			hasPermission,
			hasPermissionResource,
			logout,
			updatePreference,
		},
		data: {
			fileExports: fileExportsData || [],
			user: meData,
		},
		flags: {
			error: meError,
			loading: meLoading,
		},
		mutate: {
			fileExports: fileExportsMutate,
			me: meMutate,
		},
	}), [
		meData,
		meLoading,
		meError,
		fileExportsData,
		fileExportsLoading,
		fileExportsError,
	]);

	//
	// D. Render components

	if (meLoading) {
		return <LoadingOverlay fullscreen />;
	}

	if (meError) {
		return <ErrorDisplay message={meError.message} />;
	}

	return (
		<MeContext.Provider value={contextValue}>
			{children}
		</MeContext.Provider>
	);

	//
};

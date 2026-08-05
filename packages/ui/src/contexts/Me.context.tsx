'use client';

import { API_ROUTES, HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FileExport } from '@tmlmobilidade/go-types-downloads';
import { type ActionsOf, GetScopePermissionsArgs, type HasPermissionResourceArgs, type Permission, PermissionCatalog, type ScopePermissions, type User, type UserPreferenceValue } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

import { ErrorDisplay } from '../components/display/ErrorDisplay';
import { LoadingOverlay } from '../components/loaders/LoadingOverlay';

/* * */

interface MeContextState {
	actions: {
		getPreference: <T extends UserPreferenceValue>(scope: string, key: string) => T | undefined
		getScopePermissions: <S extends Permission['scope']>(args: Omit<GetScopePermissionsArgs<S>, 'permissions'>) => ScopePermissions<S>
		hasPermission: (scope: string, action: string) => boolean
		hasPermissionResource: (args: Omit<HasPermissionResourceArgs, 'permissions'> | Omit<HasPermissionResourceArgs, 'permissions'>[]) => boolean
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

export const useMeContext = () => {
	const context = useContext(MeContext);
	if (!context) throw new Error('useMeContext must be used within a MeContextProvider');
	return context;
};

/* * */

export const MeContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	//
	// B. Fetch data

	const { data: meData, error: meError, isLoading: meLoading, mutate: meMutate } = useSWR<User, HttpException>(API_ROUTES.auth.USERS_ME, { refreshInterval: 15_000 });
	const { data: fileExportsData, mutate: fileExportsMutate } = useSWR<FileExport[], HttpException>(API_ROUTES.exporter.EXPORTER_LIST, { refreshInterval: 5_000 });

	//
	// C. Handle actions

	const isUnauthorized = meError?.statusCode === HTTP_STATUS.UNAUTHORIZED;
	const isRedirectingToLogin = isLoggingOut || isUnauthorized || (!meLoading && !meData);

	useEffect(() => {
		// Skip if data is still loading or logout is already redirecting
		if (meLoading || isLoggingOut) return;
		// Redirect to login when the session is missing or expired
		if (!meData || isUnauthorized) window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	}, [meLoading, meData, isUnauthorized, isLoggingOut]);

	const hasPermission = <S extends Permission['scope']>(scope: S, action: ActionsOf<S>) => {
		if (!meData?.permissions) return false;
		return PermissionCatalog.hasPermission(meData.permissions, scope, action);
	};

	const hasPermissionResource = (args: HasPermissionResourceArgs | HasPermissionResourceArgs[]) => {
		// Skip if user or permissions are not available
		if (!meData?.permissions) return false;
		// If args is an array, ensure all conditions are met to return true
		if (Array.isArray(args)) return args.every(arg => PermissionCatalog.hasPermissionResource({ ...arg, permissions: meData.permissions }));
		// Otherwise, check the single condition
		else return PermissionCatalog.hasPermissionResource({ ...args, permissions: meData.permissions });
	};

	const getScopePermissions = <S extends Permission['scope']>(args: Omit<GetScopePermissionsArgs<S>, 'permissions'>): ScopePermissions<S> => {
		return PermissionCatalog.getScopePermissions({
			...args,
			permissions: meData?.permissions || [],
		});
	};

	const logout = async () => {
		setIsLoggingOut(true);
		try {
			// Call the logout endpoint
			await fetch(API_ROUTES.auth.AUTH_LOGOUT, { credentials: 'include' });
			// Clear the SWR cache without revalidating — the session is already gone,
			// so a revalidate would 401 and surface ErrorDisplay before redirect.
			await meMutate(undefined, { revalidate: false });
		} finally {
			// Always redirect to login, even if logout or cache clear fails
			window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
		}
	};

	const getPreference = <T extends UserPreferenceValue>(scope: string, key: string): T | undefined => {
		return meData?.preferences?.[scope]?.[key] as T | undefined;
	};

	const updatePreference = async (scope: string, key: string, value: undefined | UserPreferenceValue) => {
		// Skip if user data is not available
		if (!meData) return;
		// Merge current with updated preferences
		const currentPreferences = meData.preferences ?? {};
		const currentScope = currentPreferences[scope] ?? {};
		const updatedScope = { ...currentScope, [key]: value };
		const updatedPreferences = { ...currentPreferences, [scope]: updatedScope };
		// Call the update endpoint
		await fetchData<User>(API_ROUTES.auth.USERS_ME, 'PUT', { preferences: updatedPreferences });
	};

	//
	// D. Define context value

	const contextValue: MeContextState = {
		actions: {
			getPreference,
			getScopePermissions,
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
			loading: meLoading || isLoggingOut,
		},
		mutate: {
			fileExports: fileExportsMutate,
			me: meMutate,
		},
	};

	//
	// E. Render components

	if (meLoading || isRedirectingToLogin) {
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

'use client';

import { API_ROUTES, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type MeUser, type UserPreferenceValue } from '@tmlmobilidade/go-types-core';
import { type ActionsOf, type GetScopePermissionsArgs, type HasPermissionResourceArgs, type Permission, PermissionCatalog, type ScopePermissions } from '@tmlmobilidade/go-types-permissions';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useMePermissions, useMeUser } from '../auth';
import { ErrorDisplay } from '../components/display/ErrorDisplay';
import { fetchApiData } from '../fetch/fetch-api-data';
import { LoadingOverlay } from '../loaders/LoadingOverlay';

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
		permissions: Permission[] | undefined
		user: MeUser | undefined
	}
	flags: {
		error?: HttpException
		loading: boolean
	}
	mutate: {
		permissions: () => void
		user: () => void
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

	const { data: meUser, error: meError, isAuthenticated, isLoading: meLoading, mutate: meMutate } = useMeUser();
	const { data: mePermissions, error: mePermissionsError, isAuthenticated: arePermissionsAuthenticated, isLoading: mePermissionsLoading, mutate: mePermissionsMutate } = useMePermissions();

	//
	// C. Handle actions

	const isUnauthorized = isAuthenticated === false || arePermissionsAuthenticated === false;
	const isRedirectingToLogin = isLoggingOut || isUnauthorized;

	useEffect(() => {
		// Skip if data is still loading or logout is already redirecting
		if (meLoading || mePermissionsLoading || isLoggingOut) return;
		// Redirect to login when the session is missing or expired
		if (isUnauthorized) {
			const loginUrl = new URL(PAGE_ROUTES.core.LOGIN_LIST, window.location.origin);
			loginUrl.searchParams.set('redirect', `${window.location.pathname}${window.location.search}`);
			window.location.href = loginUrl.href;
		}
	}, [meLoading, mePermissionsLoading, isUnauthorized, isLoggingOut]);

	const hasPermission = <S extends Permission['scope']>(scope: S, action: ActionsOf<S>) => {
		if (!mePermissions) return false;
		return PermissionCatalog.hasPermission(mePermissions, scope, action);
	};

	const hasPermissionResource = (args: HasPermissionResourceArgs | HasPermissionResourceArgs[]) => {
		// Skip if user or permissions are not available
		if (!mePermissions) return false;
		// If args is an array, ensure all conditions are met to return true
		if (Array.isArray(args)) return args.every(arg => PermissionCatalog.hasPermissionResource({ ...arg, permissions: mePermissions }));
		// Otherwise, check the single condition
		else return PermissionCatalog.hasPermissionResource({ ...args, permissions: mePermissions });
	};

	const getScopePermissions = <S extends Permission['scope']>(args: Omit<GetScopePermissionsArgs<S>, 'permissions'>): ScopePermissions<S> => {
		return PermissionCatalog.getScopePermissions({
			...args,
			permissions: mePermissions || [],
		});
	};

	const logout = async () => {
		setIsLoggingOut(true);
		try {
			// Call the logout endpoint
			await fetch(API_ROUTES.core.AUTH_LOGOUT, { credentials: 'include' });
			// Clear the SWR cache without revalidating — the session is already gone,
			// so a revalidate would 401 and surface ErrorDisplay before redirect.
			meMutate();
			mePermissionsMutate();
		} finally {
			// Always redirect to login, even if logout or cache clear fails
			window.location.href = PAGE_ROUTES.core.LOGIN_LIST;
		}
	};

	const getPreference = <T extends UserPreferenceValue>(scope: string, key: string): T | undefined => {
		return meUser?.preferences?.[scope]?.[key] as T | undefined;
	};

	const updatePreference = async (scope: string, key: string, value: undefined | UserPreferenceValue) => {
		// Skip if user data is not available
		if (!meUser) return;
		// Merge current with updated preferences
		const currentPreferences = meUser.preferences ?? {};
		const currentScope = currentPreferences[scope] ?? {};
		const updatedScope = { ...currentScope, [key]: value };
		const updatedPreferences = { ...currentPreferences, [scope]: updatedScope };
		// Call the update endpoint
		await fetchApiData<MeUser>({ body: { preferences: updatedPreferences }, method: 'PUT', url: API_ROUTES.core.ME_UPDATE_PREFERENCES });
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
			permissions: mePermissions,
			user: meUser,
		},
		flags: {
			error: null,
			loading: meLoading || mePermissionsLoading || isLoggingOut,
		},
		mutate: {
			permissions: mePermissionsMutate,
			user: meMutate,
		},
	};

	//
	// E. Render components

	if (meLoading || mePermissionsLoading || isRedirectingToLogin) {
		return <LoadingOverlay size="lg" fullscreen />;
	}

	if (meError && !meUser) {
		return <ErrorDisplay message={meError} />;
	}
	if (mePermissionsError && !mePermissions) {
		return <ErrorDisplay message={mePermissionsError} />;
	}
	if (!meUser || !mePermissions) return <LoadingOverlay size="lg" fullscreen />;

	return (
		<MeContext.Provider value={contextValue}>
			{children}
		</MeContext.Provider>
	);

	//
};

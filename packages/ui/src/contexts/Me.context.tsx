'use client';

import { API_ROUTES, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ActionsOf, type FileExport, GetScopePermissionsArgs, type HasPermissionResourceArgs, type Permission, PermissionCatalog, type ScopePermissions, type User, type UserPreferenceValue } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect } from 'react';
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
	// A. Fetch data

	const { data: meData, error: meError, isLoading: meLoading, mutate: meMutate } = useSWR<User, HttpException>(API_ROUTES.auth.USERS_ME, { refreshInterval: 15_000 });
	const { data: fileExportsData, mutate: fileExportsMutate } = useSWR<FileExport[], HttpException>(API_ROUTES.exporter.EXPORTER_LIST, { refreshInterval: 5_000 });
	const { mutate: userMutate } = useSWR<User>(meData?._id && API_ROUTES.auth.USERS_DETAIL('me'));

	//
	// B. Handle actions

	useEffect(() => {
		// Skip if data is still loading
		if (meLoading) return;
		// If a user is not available redirect to login page
		if (!meData) window.location.href = PAGE_ROUTES.auth.LOGIN_LIST;
	}, [meLoading, meData]);

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
		// Call the logout endpoint
		await fetch(API_ROUTES.auth.AUTH_LOGOUT, { credentials: 'include' });
		// Mutate the SWR cache to remove user data
		await meMutate(undefined, { revalidate: true });
		// Redirect to home page
		window.location.href = '/';
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
		// Mutate the SWR cache to update user data
		await meMutate();
		await userMutate();
	};

	//
	// C. Define context value

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
			loading: meLoading,
		},
		mutate: {
			fileExports: fileExportsMutate,
			me: meMutate,
		},
	};

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

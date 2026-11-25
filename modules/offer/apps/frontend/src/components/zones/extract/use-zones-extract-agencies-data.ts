'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type SelectDataItem, useMePermissions } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useZonesAgenciesData } from '../shared/use-zones-agencies-data';

/* * */

interface UseZonesExtractAgenciesDataReturnType {
	error: null | string
	hasReadPermission: boolean
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
}

/**
 * Provides extraction options using the same combined
 * agency access as the Zones API.
 */
export function useZonesExtractAgenciesData(): UseZonesExtractAgenciesDataReturnType {
	//

	//
	// A. Setup variables

	const { data: mePermissions, error: mePermissionsError, isLoading: mePermissionsLoading } = useMePermissions();
	const { error: agenciesError, isLoading: agenciesLoading, options } = useZonesAgenciesData();

	//
	// B. Transform data

	const agencyAccess = useMemo(() => PermissionCatalog.getPermissionResourceAccess({
		checks: [
			{ action: 'read', scope: 'lines' },
			{ action: 'update', scope: 'lines' },
			{ action: 'nav', scope: 'zones' },
		],
		permissions: mePermissions,
		resource_key: 'agency_ids',
	}), [mePermissions]);

	const permittedOptions = useMemo(() => {
		return options.filter(option => agencyAccess.allowAll || agencyAccess.values.includes(option.value));
	}, [agencyAccess, options]);

	const ids = useMemo(() => {
		return permittedOptions.map(option => option.value);
	}, [permittedOptions]);

	//
	// C. Return data

	return useMemo(() => ({
		error: mePermissionsError ?? agenciesError,
		hasReadPermission: !mePermissionsError && (agencyAccess.allowAll || agencyAccess.values.length > 0),
		ids,
		isLoading: mePermissionsLoading || agenciesLoading,
		options: permittedOptions,
	}), [mePermissionsError, agenciesError, agencyAccess, ids, mePermissionsLoading, agenciesLoading, permittedOptions]);
}

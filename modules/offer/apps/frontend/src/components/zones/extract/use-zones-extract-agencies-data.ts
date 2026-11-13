'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type SelectDataItem, useMeData } from '@tmlmobilidade/ui';
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

/* * */

/** Provides extraction options using the same combined agency access as the Zones API. */
export function useZonesExtractAgenciesData(): UseZonesExtractAgenciesDataReturnType {
	const { data: meData, error: meError, isLoading: meLoading } = useMeData();
	const { error: agenciesError, isLoading: agenciesLoading, options } = useZonesAgenciesData();

	const agencyAccess = useMemo(() => PermissionCatalog.getPermissionResourceAccess({
		// Mirrors ZONES_READ_PERMISSION_CHECKS and the offer-zones extractor.
		checks: [
			{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.zones.actions.nav, scope: PermissionCatalog.all.zones.scope },
		],
		permissions: meData?.permissions,
		resource_key: 'agency_ids',
	}), [meData?.permissions]);

	const permittedOptions = useMemo(() => options.filter(option => agencyAccess.allowAll || agencyAccess.values.includes(option.value)), [agencyAccess, options]);
	const ids = useMemo(() => permittedOptions.map(option => option.value), [permittedOptions]);
	const error = meError ?? agenciesError;
	const hasReadPermission = !meError && (agencyAccess.allowAll || agencyAccess.values.length > 0);
	const isLoading = meLoading || agenciesLoading;

	return useMemo(() => ({ error, hasReadPermission, ids, isLoading, options: permittedOptions }), [error, hasReadPermission, ids, isLoading, permittedOptions]);
}

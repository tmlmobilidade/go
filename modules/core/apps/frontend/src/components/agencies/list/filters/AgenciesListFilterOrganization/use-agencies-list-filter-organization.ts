'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useAgenciesOrganizationsData } from '../../../shared/use-agencies-organizations-data';

/**
 * Manages the organization filter for the agencies list in the URL.
 */
export function useAgenciesListFilterOrganization(): UseFilterStateListReturnType {
	const { ids, options } = useAgenciesOrganizationsData();
	return useFilterStateList('organization', ids, options);
}

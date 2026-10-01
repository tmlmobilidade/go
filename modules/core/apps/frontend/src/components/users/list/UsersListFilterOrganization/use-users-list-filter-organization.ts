'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useUsersOrganizationsData } from '../../shared/use-users-organizations-data';

/**
 * Hook to manage the organization IDs filter for the users list filter bar.
 * @returns The filter state management object.
 */
export function useUsersListFilterOrganization(): UseFilterStateListReturnType {
	//

	const { ids, options } = useUsersOrganizationsData();

	return useFilterStateList('organization', ids, options);
}

'use client';

import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';

import { useUsersRolesData } from '../../shared/use-users-roles-data';

/**
 * Hook to manage the role IDs filter for the users list filter bar.
 * @returns The filter state management object.
 */
export function useUsersListFilterRole(): UseFilterStateListReturnType {
	//

	const { ids, options } = useUsersRolesData();

	return useFilterStateList('role', ids, options);
}

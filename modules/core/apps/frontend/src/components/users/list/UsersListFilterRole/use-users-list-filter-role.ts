'use client';

import { type UserRole, UserRoleSchema } from '@tmlmobilidade/go-types-operation';
import { useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUsersListData } from '../use-users-list-data';

/**
 * Hook to manage the reference type filter for the alerts list filter bar.
 * @returns The filter state management object.
 */
export function useUsersListFilterRole(): UseFilterStateListReturnType<UserRole> {
	//

	const { t } = useTranslation();

	const { data } = useUsersListData();

	const selectOptions = useMemo(() =>
		data.raw.map(item => ({
			label: item.role_ids,
			value: item,
		})),
	[t]);

	return useFilterStateList(
		'cause',
		UserRoleSchema.options,
		selectOptions,
	);
}

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SchoolsListItem } from '@tmlmobilidade/go-schools-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useFilterStateList, type UseFilterStateListReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/**
 * Hook to manage the grouping filter for the schools list filter bar.
 * @returns The filter state management object.
 */
export function useSchoolsListFilterGrouping(): UseFilterStateListReturnType {
	const { data: schoolsResponse } = useSWR<ApiResponse<SchoolsListItem[]>>([API_ROUTES.infrastructure.SCHOOLS_LIST, {}], {
		fetcher: async ([url, query]) => await fetchApiData<SchoolsListItem[]>({ body: query, method: 'POST', url }),
	});

	const options = useMemo(() => Array.from(new Set(
		(schoolsResponse?.data ?? []).map(item => item.grouping).filter(Boolean),
	))
		.map(item => ({ label: item, value: item }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [schoolsResponse?.data]);

	return useFilterStateList(
		'groupings',
		options.map(option => option.value),
		options,
	);
}

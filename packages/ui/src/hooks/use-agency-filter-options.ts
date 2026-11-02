'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AgencyOrganization } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { type SelectDataItem } from '../components/inputs/Select';
import { fetchApiData } from '../fetch/fetch-api-data';
import { groupAgencyFilterOptions, sortAgencyFilterOptions } from './group-agency-filter-options';

/* * */

/**
 * Orders agency filter options and groups them by organization.
 */
export function useAgencyFilterOptions(options: SelectDataItem[]): SelectDataItem[] {
	//

	//
	// A. Fetch data

	const { t } = useTranslation();
	const { data } = useSWR<ApiResponse<AgencyOrganization[]>>(API_ROUTES.core.AGENCY_ORGANIZATIONS_LIST, {
		fetcher: async (url: string) => await fetchApiData<AgencyOrganization[]>({ url }),
		refreshInterval: 300_000,
	});

	//
	// B. Transform data

	const unassignedLabel = t('shared:filters.ListFilter.no_organization');

	return useMemo(() => {
		if (!data?.data) return sortAgencyFilterOptions(options);
		return groupAgencyFilterOptions(options, data.data, unassignedLabel);
	}, [data?.data, options, unassignedLabel]);
}

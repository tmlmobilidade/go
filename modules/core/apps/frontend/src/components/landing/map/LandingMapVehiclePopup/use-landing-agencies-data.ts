'use client';

import { type HubV1ApiAgency } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import useSWR from 'swr';

/* * */

export function useLandingAgenciesData() {
	const { data } = useSWR<ApiResponse<HubV1ApiAgency[]>>('https://go.tmlmobilidade.pt/hub/api/v1/WORLD/agencies', {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiAgency[]>({ credentials: 'omit', url }),
	});
	return data?.data ?? [];
}

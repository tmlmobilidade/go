'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ContentModuleId, ContentModuleIdSchema, type OperationalBannerReader } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { fetchApiData } from '../../../fetch/fetch-api-data';

/* * */

interface UseActiveBannersDataReturnType {
	data: OperationalBannerReader[]
	dismiss: (banner: OperationalBannerReader) => Promise<void>
}

/* * */

/** Each module frontend is served under its own base path, e.g. `/offer`. */
function getCurrentModuleId(): ContentModuleId | undefined {
	const parsed = ContentModuleIdSchema.safeParse(window.location.pathname.split('/')[1]);
	return parsed.success ? parsed.data : undefined;
}

/* * */

export function useActiveBannersData(): UseActiveBannersDataReturnType {
	//

	//
	// A. Fetch data

	const { data, mutate } = useSWR<ApiResponse<OperationalBannerReader[]>>(API_ROUTES.core.BANNERS_LIST, {
		fetcher: (url: string) => {
			const moduleId = getCurrentModuleId();
			return fetchApiData<OperationalBannerReader[]>({ url: moduleId ? `${url}?module_id=${moduleId}` : url });
		},
		refreshInterval: 60_000,
	});

	//
	// B. Handle actions

	const dismiss = useCallback(async (banner: OperationalBannerReader) => {
		await fetchApiData({
			body: { dismissal_version: banner.dismissal_version, module_id: getCurrentModuleId() },
			method: 'POST',
			url: API_ROUTES.core.BANNERS_DETAIL_DISMISS(banner._id),
		});
		await mutate();
	}, [mutate]);

	//
	// C. Return data

	return useMemo(() => ({ data: data?.data ?? [], dismiss }), [data?.data, dismiss]);
}

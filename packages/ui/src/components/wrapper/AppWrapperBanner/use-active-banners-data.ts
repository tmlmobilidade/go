'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type BannerDismissPlatformResponse, type BannerPlatformResponse } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type ModuleId, ModuleIdSchema } from '@tmlmobilidade/go-types-shared';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { fetchApiData } from '../../../fetch/fetch-api-data';
import { useToast } from '../../../hooks/toast';

/* * */

interface UseActiveBannersDataReturnType {
	data: BannerPlatformResponse[]
	dismiss: (banner: BannerPlatformResponse) => Promise<void>
}

/* * */

/** Each module frontend is served under its own base path, e.g. `/offer`. */
function getCurrentModuleId(): ModuleId | undefined {
	const parsed = ModuleIdSchema.safeParse(window.location.pathname.split('/')[1]);
	return parsed.success ? parsed.data : undefined;
}

/* * */

export function useActiveBannersData(): UseActiveBannersDataReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data, mutate } = useSWR<ApiResponse<BannerPlatformResponse[]>>(API_ROUTES.core.BANNERS_ACTIVE, {
		fetcher: (url: string) => {
			const moduleId = getCurrentModuleId();
			return fetchApiData<BannerPlatformResponse[]>({ url: moduleId ? `${url}?module_id=${moduleId}` : url });
		},
		refreshInterval: 60_000,
	});

	//
	// C. Handle actions

	const dismiss = useCallback(async (banner: BannerPlatformResponse) => {
		const response = await fetchApiData<BannerDismissPlatformResponse>({
			body: { dismissal_version: banner.dismissal_version, module_id: getCurrentModuleId() },
			method: 'POST',
			url: API_ROUTES.core.BANNERS_DETAIL_DISMISS(banner._id),
		});

		if (response.error || !response.data?.success) {
			useToast.error({ message: response.error || t('shared:components.banner.dismiss_error') });
			return;
		}

		await mutate((current) => {
			if (current?.status_code !== '200') return current;

			return {
				...current,
				data: current.data.filter(item => item._id !== banner._id || item.dismissal_version !== banner.dismissal_version),
			};
		}, { revalidate: false });
	}, [mutate, t]);

	//
	// D. Return data

	return useMemo(() => ({ data: data?.data ?? [], dismiss }), [data?.data, dismiss]);
}

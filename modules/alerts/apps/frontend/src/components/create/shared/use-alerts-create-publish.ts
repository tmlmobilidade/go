'use client';

import { useAlertsListData } from '@/components/list/shared/use-alerts-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert } from '@tmlmobilidade/go-types-operation';
import { ApiResponse } from '@tmlmobilidade/go-types-shared';
import { keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { useAlertsCreateFormContext } from './AlertsCreateForm.context';

/* * */

interface UseAlertsCreatePublishReturnType {
	isLoading: boolean
	publish: () => Promise<void>
}

/* * */

export function useAlertsCreatePublish(): UseAlertsCreatePublishReturnType {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { mutate } = useAlertsListData();

	const { form, unblock } = useAlertsCreateFormContext();

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchDataNew<Alert>(API_ROUTES.alerts.ALERTS_CREATE, 'POST', form.getValues()),
		onSuccess: (data) => {
			form.reset();
			unblock();
			mutate();
			console.log('new alert data', data);
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(data.data._id));
				window.location.href = newUrl;
			};
		},
	});

	//
	// C. Return state

	return useMemo(() => ({
		isLoading,
		publish: action,
	}), [action, isLoading]);
}

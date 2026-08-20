'use client';

import { useAlertsListData } from '@/components/list/shared/use-alerts-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert } from '@tmlmobilidade/go-types-operation';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
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

	const { mutate } = useAlertsListData();

	const { form, unblock } = useAlertsCreateFormContext();

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'POST', url: API_ROUTES.alerts.ALERTS_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(data._id));
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

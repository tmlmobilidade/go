'use client';

import { useAlertsListData } from '@/components/alerts/list/use-alerts-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert } from '@tmlmobilidade/go-types-operation';
import { fetchApiData, keepUrlParams, useHandleAction } from '@tmlmobilidade/ui';
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

	const { action, isLoading } = useHandleAction({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'POST', url: API_ROUTES.operation.ALERTS_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.operation.ALERTS_DETAIL(data._id));
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

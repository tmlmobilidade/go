'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { School } from '@tmlmobilidade/go-types-operation';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useSchoolsListData } from '../list/use-schools-list-data';
import { useSchoolCreateFormContext } from './SchoolCreateForm.context';

/* * */

interface UseSchoolCreatePublishReturnType {
	isLoading: boolean
	publish: () => Promise<void>
}

/* * */

export function useSchoolCreatePublish(): UseSchoolCreatePublishReturnType {
	//

	//
	// A. Setup variables

	const { mutate } = useSchoolsListData();

	const { form, unblock } = useSchoolCreateFormContext();

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ body: form.getValues(), method: 'POST', url: API_ROUTES.schools.SCHOOLS_CREATE }),
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

'use client';

import { useSchoolsListData } from '@/components/schools/list/use-schools-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { School } from '@tmlmobilidade/go-types-operation';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';

import { useSchoolsCreateFormContext } from './SchoolsCreateForm.context';

/* * */

interface UseSchoolsCreatePublishReturnType {
	isLoading: boolean
	publish: () => Promise<void>
}

/* * */

export function useSchoolsCreatePublish(): UseSchoolsCreatePublishReturnType {
	//

	//
	// A. Setup variables

	const { mutate } = useSchoolsListData();

	const { form, unblock } = useSchoolsCreateFormContext();

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ body: form.getValues(), method: 'POST', url: `${API_ROUTES.infrastructure.BASE}/schools` }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_DETAIL(data._id));
				window.location.href = newUrl;
			};
		},
	});

	const publish = useCallback(async () => {
		if (!(await form.trigger())) return;
		await action();
	}, [action, form]);

	//
	// C. Return state

	return useMemo(() => ({
		isLoading,
		publish,
	}), [isLoading, publish]);
}

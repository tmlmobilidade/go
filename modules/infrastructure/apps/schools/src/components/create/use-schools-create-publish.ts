'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { School } from '@tmlmobilidade/go-types-operation';
import { fetchApiData, keepUrlParams, useHandleUpdate } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
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
	const router = useRouter();

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
				router.push(keepUrlParams(PAGE_ROUTES.schools.SCHOOLS_DETAIL(data._id)));
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

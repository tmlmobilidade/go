'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type TypologiesFareItem } from '@tmlmobilidade/go-offer-pckg-types';
import { FARE_PAYMENT_METHOD } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseTypologiesFaresDataReturnType {
	error: null | string
	isLoading: boolean
	onboardOptions: SelectDataItem[]
	prepaidOptions: SelectDataItem[]
}

/* * */

export function useTypologiesFaresData(): UseTypologiesFaresDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<TypologiesFareItem[]>>(API_ROUTES.offer.TYPOLOGIES_LIST_FARES, {
		fetcher: async (url: string) => await fetchApiData<TypologiesFareItem[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		error: data?.error ?? error?.message ?? null,
		isLoading,
		onboardOptions: (data?.data ?? []).filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.ONBOARD).map(fare => ({ label: fare.name, value: fare._id })),
		prepaidOptions: (data?.data ?? []).filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.PREPAID).map(fare => ({ label: fare.name, value: fare._id })),
	}), [data, error, isLoading]);
}

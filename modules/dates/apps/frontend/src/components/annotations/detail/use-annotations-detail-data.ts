'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAnnotationsDetailAnnotationId } from './use-annotations-detail-annotation-id';

/* * */

interface UseAnnotationsDetailDataReturnType {
	data: Annotation | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Annotation>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAnnotationsDetailData(): UseAnnotationsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { annotationId } = useAnnotationsDetailAnnotationId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Annotation>>(API_ROUTES.dates.ANNOTATIONS_DETAIL(annotationId), {
		fetcher: async (url: string) => await fetchApiData<Annotation>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);
};

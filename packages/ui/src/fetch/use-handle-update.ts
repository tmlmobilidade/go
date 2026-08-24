'use client';

import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useCallback, useRef, useState } from 'react';

import { useToast } from '../hooks/toast';

/* * */

interface UseHandleUpdateProps<T, A = void> {
	fetchFn: (requestData: A) => Promise<ApiResponse<T>>
	labels?: {
		error_message?: string
		error_title?: string
		success_message?: string
		success_title?: string
	}
	onError?: (error: Error) => void
	onSuccess: (response: ApiResponse<T>) => void
}

interface UseHandleUpdateReturnType<A> {
	action: (requestData: A) => Promise<void>
	isError: Error | undefined
	isLoading: boolean
}

/**
 * Handles the update of an item.
 * @param params The parameters for the update operation.
 */
export function useHandleUpdate<T, A = void>({ fetchFn, labels, onError, onSuccess }: UseHandleUpdateProps<T, A>): UseHandleUpdateReturnType<A> {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState<Error | undefined>(undefined);

	// Keep latest versions of all callbacks/options in refs so that `action`
	// can be memoized without becoming stale.

	const fetchFnRef = useRef(fetchFn);
	fetchFnRef.current = fetchFn;

	const onSuccessRef = useRef(onSuccess);
	onSuccessRef.current = onSuccess;

	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;

	const labelsRef = useRef(labels);
	labelsRef.current = labels;

	//
	// B. Handle actions

	const action = useCallback(async (requestData: A) => {
		setIsLoading(true);
		const response = await fetchFnRef.current(requestData);
		if (!response) {
			const error = new Error('No response from server');
			useToast.error({ message: error.message, title: labelsRef.current?.error_title ?? 'Erro' });
			setIsLoading(false);
			setIsError(error);
			onErrorRef.current?.(error);
			return;
		}
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: labelsRef.current?.error_title ?? 'Erro' });
				setIsLoading(false);
				setIsError(new Error(response.error));
				onErrorRef.current?.(new Error(response.error));
				return;
			}
			setIsLoading(false);
			setIsError(new Error('Erro ao atualizar item'));
			onErrorRef.current?.(new Error('Erro ao atualizar item'));
			return;
		}
		setIsLoading(false);
		useToast.success({ message: labelsRef.current?.success_message, title: labelsRef.current?.success_title ?? 'Sucesso' });
		onSuccessRef.current(response);
	}, []);

	//
	// C. Return values

	return { action, isError, isLoading };

	//
};

'use client';

/* * */

import { type HttpResponse } from '@tmlmobilidade/utils';
import { useState } from 'react';

import { useToast } from './toast';

/* * */

interface UseFlagReadOnlyProps<T> {
	fetchFn: () => Promise<HttpResponse<T>>
	labels?: {
		error_message?: string
		error_title?: string
		success_message?: string
		success_title?: string
	}
	onError?: (error: Error) => void
	onSuccess: (item: T) => void
}

interface UseFlagReadOnlyReturnType {
	action: () => Promise<void>
	isError: Error | undefined
	isLoading: boolean
}

/**
 * Handles the read-only flag of an item.
 * @param params The parameters for the update operation.
 */
export function useFlagReadOnly<T>({ fetchFn, labels, onError, onSuccess }: UseFlagReadOnlyProps<T>): UseFlagReadOnlyReturnType {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState<Error | undefined>(undefined);

	//
	// B. Handle actions

	const action = async () => {
		setIsLoading(true);
		const response = await fetchFn();
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: labels?.error_title ?? 'Erro' });
				setIsLoading(false);
				setIsError(new Error(response.error));
				onError?.(new Error(response.error));
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: labels?.error_title ?? 'Erro' });
			}
			setIsLoading(false);
			setIsError(new Error('Erro ao atualizar item'));
			onError?.(new Error('Erro ao atualizar item'));
			return;
		}
		setIsLoading(false);
		useToast.success({ message: labels?.success_message ?? 'Paragem bloqueada com sucesso.', title: labels?.success_title ?? 'Sucesso' });
		onSuccess(response.data);
	};

	//
	// C. Return values

	return { action, isError, isLoading };

	//
};

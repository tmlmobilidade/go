'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type File, type GtfsValidation, ProcessingStatus } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationsDetailContextState {
	actions: {
		approvePlan: () => Promise<void>
		updateValidationStatus: (status: ProcessingStatus) => Promise<GtfsValidation>
	}
	data: {
		file: File | null
		validation: GtfsValidation | null
	}
	flags: {
		can_approve: boolean
		error: Error | null
		loading: boolean
	}
}

/* * */

const ValidationsDetailContext = createContext<undefined | ValidationsDetailContextState>(undefined);

export function useValidationsDetailContext() {
	const context = useContext(ValidationsDetailContext);
	if (!context) {
		throw new Error('useValidationsDetailContext must be used within a ValidationsDetailContextProvider');
	}
	return context;
}

/* * */

export const ValidationsDetailContextProvider = ({ children, validationId }: PropsWithChildren<{ validationId: string }>) => {
	//

	//
	// A. Fetch data

	const { data: validationData, error: validationError, isLoading: validationLoading, mutate: validationMutate } = useSWR<GtfsValidation>(validationId && API_ROUTES.plans.VALIDATIONS_DETAIL(validationId), { refreshInterval: 3_000 });
	const { data: fileData, error: fileError, isLoading: fileLoading } = useSWR<File>(validationId && API_ROUTES.plans.VALIDATIONS_DETAIL_FILE(validationId));

	//
	// B. Handle actions

	const handleUpdateValidationStatus = useCallback(async (status: ProcessingStatus) => {
		if (!validationId) {
			useToast.error({ message: 'ID da validação é obrigatório.', title: 'Erro' });
			return;
		}
		try {
			const response = await fetchData<GtfsValidation>(API_ROUTES.plans.VALIDATIONS_DETAIL(validationId) + '/status', 'PUT', {
				feeder_status: status,
			});
			if (response.error || !response.data) {
				useToast.error({ message: response.error ?? 'Erro ao atualizar estado da validação.', title: 'Erro' });
				return;
			}
			// Update SWR cache so UI reflects new feeder_status immediately
			await validationMutate(response.data);
			return response.data;
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao atualizar estado da validação.', title: 'Erro' });
			return;
		}
	}, [validationId, validationMutate]);

	const approvePlan = useCallback(async () => {
		if (!validationId) return;
	}, [validationId]);

	//
	// C. Define context value

	const contextValue: ValidationsDetailContextState = useMemo(() => ({
		actions: {
			approvePlan,
			updateValidationStatus: handleUpdateValidationStatus,
		},
		data: {
			file: fileData,
			validation: validationData,
		},
		flags: {
			can_approve: validationData?.feeder_status === 'complete',
			error: validationError || fileError,
			loading: validationLoading || fileLoading,
		},
	}), [
		approvePlan,
		fileData,
		fileError,
		fileLoading,
		handleUpdateValidationStatus,
		validationData,
		validationError,
		validationLoading,
	]);

	//
	// D. Render components

	return (
		<ValidationsDetailContext.Provider value={contextValue}>
			{children}
		</ValidationsDetailContext.Provider>
	);

	//
};

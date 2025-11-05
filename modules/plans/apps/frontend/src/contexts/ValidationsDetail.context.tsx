'use client';

/* * */

import { type File, type GtfsValidation } from '@tmlmobilidade/go-types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationsDetailContextState {
	actions: {
		approvePlan: () => Promise<void>
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

	const { data: validationData, error: validationError, isLoading: validationLoading } = useSWR<GtfsValidation>(validationId && `/api/validations/${validationId}`, { refreshInterval: 3_000 });
	const { data: fileData, error: fileError, isLoading: fileLoading } = useSWR<File>(validationId && `/api/validations/${validationId}/file`);

	//
	// B. Handle actions

	const approvePlan = async () => {
		if (!validationId) return;
	};

	//
	// C. Define context value

	const contextValue: ValidationsDetailContextState = useMemo(() => ({
		actions: {
			approvePlan,
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
		validationData,
		validationLoading,
		validationError,
		fileData,
		fileLoading,
		fileError,
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

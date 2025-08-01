'use client';

/* * */

import { type File, type Validation } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationsDetailContextState {
	actions: {
		convertToPlan: () => Promise<void>
	}
	data: {
		file: File | null
		validation: null | Validation
	}
	flags: {
		can_convert: boolean
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

	const { data: validationData, error: validationError, isLoading: validationLoading } = useSWR<Validation>(validationId && `/api/validations/${validationId}`, swrFetcher, { refreshInterval: 3_000 });
	const { data: fileData, error: fileError, isLoading: fileLoading } = useSWR<File>(validationId && `/api/validations/${validationId}/file`, swrFetcher);

	//
	// B. Transform data

	const canConvert = useMemo(() => {
		if (!validationData || !fileData) return false;
		if (validationData.feeder_status !== 'complete') return false;
		return false;
	}, [validationData, fileData]);

	//
	// C. Handle actions

	const convertToPlan = async () => {
		if (!validationId) return;
	};

	//
	// D. Define context value

	const contextValue: ValidationsDetailContextState = useMemo(() => ({
		actions: {
			convertToPlan,
		},
		data: {
			file: fileData,
			validation: validationData,
		},
		flags: {
			can_convert: canConvert,
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
		canConvert,
	]);

	//
	// E. Render Components

	return (
		<ValidationsDetailContext.Provider value={contextValue}>
			{children}
		</ValidationsDetailContext.Provider>
	);

	//
};

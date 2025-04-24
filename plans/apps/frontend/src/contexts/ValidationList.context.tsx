'use client';

/* * */

import { Routes } from '@/lib/routes';
import { OperationalDate, Validation } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationListContextState {
	actions: {
		changeValidFrom: (date: Date | null) => void
		changeValidUntil: (date: Date | null) => void
	}
	data: {
		filtered: Validation[]
		raw: Validation[]
	}
	filters: {
		validFrom: null | OperationalDate
		validUntil: null | OperationalDate
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const ValidationListContext = createContext<undefined | ValidationListContextState>(undefined);

export const useValidationListContext = () => {
	const context = useContext(ValidationListContext);
	if (!context) {
		throw new Error('useValidationListContext must be used within a ValidationListContextProvider');
	}
	return context;
};

/* * */

export const ValidationListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables
	const [filterValidFrom, setFilterValidFrom] = useState<null | OperationalDate>(null);
	const [filterValidUntil, setFilterValidUntil] = useState<null | OperationalDate>(null);

	//
	// B. Fetch data
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<Validation[], Error>(Routes.API(Routes.PLAN_LIST), swrFetcher);

	//
	// C. Transform data

	const rawValidations = useMemo(() => {
		return allValidationsData || [];
	}, [allValidationsData]);

	const filteredValidations = useMemo(() => {
		const validations = rawValidations;

		return validations;
	}, [rawValidations]);

	//
	// D. Handle actionsn
	function handleChangeValidFrom(date: Date | null) {
		setFilterValidFrom(date ? Dates.fromJSDate(date).operational_date : null);
	}

	function handleChangeValidUntil(date: Date | null) {
		setFilterValidUntil(date ? Dates.fromJSDate(date).operational_date : null);
	}

	//
	// E. Define context value

	const contextValue: ValidationListContextState = useMemo(() => ({
		actions: {
			changeValidFrom: handleChangeValidFrom,
			changeValidUntil: handleChangeValidUntil,
		},
		data: {
			filtered: filteredValidations,
			raw: rawValidations,
		},
		filters: {
			validFrom: filterValidFrom,
			validUntil: filterValidUntil,
		},
		flags: {
			error: allValidationsError,
			isLoading: allValidationsLoading,
		},
	}), [
		filteredValidations,
		rawValidations,
		allValidationsError,
		allValidationsLoading,
		filterValidFrom,
		filterValidUntil,
	]);

	//
	// F. Render components

	return (
		<ValidationListContext.Provider value={contextValue}>
			{children}
		</ValidationListContext.Provider>
	);

	//
};

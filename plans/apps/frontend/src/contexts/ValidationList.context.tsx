'use client';

/* * */

import { Routes } from '@/lib/routes';
import { toggleArray } from '@/lib/utils';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { OperationalDate, Validation } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationListContextState {
	actions: {
		changeValidFrom: (date: null | string) => void
		changeValidUntil: (date: null | string) => void
		toggleAgency: (agency_id: string) => void
	}
	data: {
		filtered: Validation[]
		raw: Validation[]
	}
	filters: {
		agencies: string[]
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
	const [filterAgencies, setFilterAgencies] = useState<string[]>(AVAILABLE_AGENCIES.map(agency => agency._id));

	//
	// B. Fetch data
	const { data: allValidationsData, error: allValidationsError, isLoading: allValidationsLoading } = useSWR<Validation[], Error>(Routes.API(Routes.VALIDATION_LIST), swrFetcher);

	//
	// C. Transform data

	const rawValidations = useMemo(() => {
		return allValidationsData || [];
	}, [allValidationsData]);

	const filteredValidations = useMemo(() => {
		let validations = rawValidations;

		if (filterValidFrom) {
			validations = validations.filter(validation => validation.valid_from >= filterValidFrom);
		}

		if (filterValidUntil) {
			validations = validations.filter(validation => validation.valid_until <= filterValidUntil);
		}

		validations = validations.filter(validation => filterAgencies.includes(validation.agency_id));

		return validations;
	}, [rawValidations, filterValidFrom, filterValidUntil, filterAgencies]);

	//
	// D. Handle actionsn
	function handleChangeValidFrom(date: null | string) {
		setFilterValidFrom(date ? Dates.fromFormat(date, 'yyyy-MM-dd').operational_date : null);
	}

	function handleChangeValidUntil(date: null | string) {
		setFilterValidUntil(date ? Dates.fromFormat(date, 'yyyy-MM-dd').operational_date : null);
	}

	function handleToggleAgency(agency_id: string) {
		if (agency_id === 'all') {
			setFilterAgencies(AVAILABLE_AGENCIES.map(agency => agency._id));
			return;
		}

		if (agency_id === 'none') {
			setFilterAgencies([]);
			return;
		}

		setFilterAgencies(toggleArray(filterAgencies, agency_id));
	}

	//
	// E. Define context value

	const contextValue: ValidationListContextState = useMemo(() => ({
		actions: {
			changeValidFrom: handleChangeValidFrom,
			changeValidUntil: handleChangeValidUntil,
			toggleAgency: handleToggleAgency,
		},
		data: {
			filtered: filteredValidations,
			raw: rawValidations,
		},
		filters: {
			agencies: filterAgencies,
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
		filterAgencies,
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

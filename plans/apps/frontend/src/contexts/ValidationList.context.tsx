'use client';

/* * */

import { Routes } from '@/lib/routes';
import { toggleArray } from '@/lib/utils';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { OperationalDate, ProcessingStatus, Validation } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface ValidationListContextState {
	actions: {
		changeValidFrom: (date: null | string) => void
		changeValidUntil: (date: null | string) => void
		setStatus: (status: Validation['feeder_status']) => void
		toggleAgency: (agency_id: string) => void
		toggleStatus: (status: 'all' | 'none' | Validation['feeder_status']) => void
	}
	data: {
		filtered: Validation[]
		raw: Validation[]
	}
	filters: {
		agencies: string[]
		status: ('all' | 'none' | Validation['feeder_status'])[]
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
	const [filterStatus, setFilterStatus] = useState<Validation['feeder_status'][]>(Object.values(ProcessingStatus));

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

		// if (filterValidFrom) {
		// 	validations = validations.filter(validation => validation.gtfs_feed_info.feed_start_date >= filterValidFrom);
		// }

		// if (filterValidUntil) {
		// 	validations = validations.filter(validation => validation.gtfs_feed_info.feed_end_date <= filterValidUntil);
		// }

		// validations = validations.filter(validation => filterAgencies.includes(validation.gtfs_agency.agency_id));

		validations = validations.filter(validation => filterStatus.includes(validation.feeder_status));

		return validations;
	}, [rawValidations, filterValidFrom, filterValidUntil, filterAgencies, filterStatus]);

	//
	// D. Handle actionsn
	function handleChangeValidFrom(date: null | string) {
		setFilterValidFrom(date ? Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date : null);
	}

	function handleChangeValidUntil(date: null | string) {
		setFilterValidUntil(date ? Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date : null);
	}

	function handleToggleStatus(status: 'all' | 'none' | Validation['feeder_status']) {
		console.log('status', status);
		if (status === 'all') {
			setFilterStatus(Object.values(ProcessingStatus));
			return;
		}

		if (status === 'none') {
			setFilterStatus([]);
			return;
		}

		setFilterStatus(toggleArray(filterStatus, status));
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

	function handleSetStatus(status: Validation['feeder_status']) {
		setFilterStatus([status]);
	}

	//
	// E. Define context value

	const contextValue: ValidationListContextState = useMemo(() => ({
		actions: {
			changeValidFrom: handleChangeValidFrom,
			changeValidUntil: handleChangeValidUntil,
			setStatus: handleSetStatus,
			toggleAgency: handleToggleAgency,
			toggleStatus: handleToggleStatus,
		},
		data: {
			filtered: filteredValidations,
			raw: rawValidations,
		},
		filters: {
			agencies: filterAgencies,
			status: filterStatus,
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

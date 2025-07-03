'use client';

/* * */

import { toggleArray } from '@/lib/utils';
import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { OperationalDate, Plan } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Dates } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlanListContextState {
	actions: {
		changeValidFrom: (date: null | string) => void
		changeValidUntil: (date: null | string) => void
		toggleAgency: (agency: string) => void
	}
	data: {
		filtered: Plan[]
		raw: Plan[]
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

const PlanListContext = createContext<PlanListContextState | undefined>(undefined);

export const usePlanListContext = () => {
	const context = useContext(PlanListContext);
	if (!context) {
		throw new Error('usePlanListContext must be used within a PlanListContextProvider');
	}
	return context;
};

/* * */

export const PlanListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const [filterValidFrom, setFilterValidFrom] = useState<null | OperationalDate>(null);
	const [filterValidUntil, setFilterValidUntil] = useState<null | OperationalDate>(null);
	const [filterAgencies, setFilterAgencies] = useState<string[]>(AVAILABLE_AGENCIES.map(agency => agency._id));

	//
	// B. Fetch data

	const { data: allPlansData, error: allPlansError, isLoading: allPlansLoading } = useSWR<Plan[], Error>('/api/plans', swrFetcher);

	//
	// C. Transform data

	const rawPlans = useMemo(() => {
		return allPlansData || [];
	}, [allPlansData]);

	const filteredPlans = useMemo(() => {
		const plans = rawPlans;

		// if (filterValidFrom) {
		// 	plans = plans.filter(plan => Dates.fromUnixTimestamp(plan?.gtfs_feed_info.feed_start_date).operational_date >= filterValidFrom);
		// }
		// if (filterValidUntil) {
		// 	plans = plans.filter(plan => Dates.fromUnixTimestamp(plan?.gtfs_feed_info.feed_end_date).operational_date <= filterValidUntil);
		// }

		// plans = plans.filter(plan => filterAgencies.includes(plan.gtfs_agency.agency_id));

		return plans;
	}, [rawPlans, filterValidFrom, filterValidUntil, filterAgencies]);

	//
	// D. Handle actionsn
	function handleChangeValidFrom(date: null | string) {
		setFilterValidFrom(date ? Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date : null);
	}

	function handleChangeValidUntil(date: null | string) {
		setFilterValidUntil(date ? Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date : null);
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

	const contextValue: PlanListContextState = useMemo(() => ({
		actions: {
			changeValidFrom: handleChangeValidFrom,
			changeValidUntil: handleChangeValidUntil,
			toggleAgency: handleToggleAgency,
		},
		data: {
			filtered: filteredPlans,
			raw: rawPlans,
		},
		filters: {
			agencies: filterAgencies,
			validFrom: filterValidFrom,
			validUntil: filterValidUntil,
		},
		flags: {
			error: allPlansError,
			isLoading: allPlansLoading,
		},
	}), [
		filteredPlans,
		rawPlans,
		allPlansError,
		allPlansLoading,
		filterValidFrom,
		filterValidUntil,
	]);

	//
	// F. Render components

	return (
		<PlanListContext.Provider value={contextValue}>
			{children}
		</PlanListContext.Provider>
	);

	//
};

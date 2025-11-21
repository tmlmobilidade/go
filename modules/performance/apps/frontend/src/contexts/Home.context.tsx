'use client';

import { AGENCIES, AgencyType, AgencyTypeWithAll } from '@/constants';
/* * */

import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

/* * */

interface HomeContextState {
	actions: {
		setSelectedAgency: (agency: AgencyTypeWithAll | null) => void
	}
	data: {
		agency_array: AgencyType[]
		selected_agency: AgencyTypeWithAll | null
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const HomeContext = createContext<HomeContextState | undefined>(undefined);

export function useHomeContext() {
	const context = useContext(HomeContext);
	if (!context) {
		throw new Error('useHomeContext must be used within a HomeContextProvider');
	}

	return context;
}

/* * */

export const HomeContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup state and translations

	const [selectedAgency, setSelectedAgency] = useState<AgencyTypeWithAll | null>('all');

	// Compute agency array based on selected agency
	const agencyArray = useMemo((): AgencyType[] => {
		if (selectedAgency === 'all') {
			return Object.values(AGENCIES);
		}
		if (selectedAgency) {
			return [selectedAgency];
		}
		return [];
	}, [selectedAgency]);

	//
	// B. Define actions

	const changeSelectedAgency = (agency: AgencyTypeWithAll | null) => {
		setSelectedAgency(agency);
	};

	//
	// D. Define context value

	const contextValue: HomeContextState = {
		actions: {
			setSelectedAgency: changeSelectedAgency,
		},
		data: {
			agency_array: agencyArray,
			selected_agency: selectedAgency,
		},
		flags: {
			is_loading: false,
		},
	};

	//
	// E. Render components

	return (
		<HomeContext.Provider value={contextValue}>
			{children}
		</HomeContext.Provider>
	);

	//
};

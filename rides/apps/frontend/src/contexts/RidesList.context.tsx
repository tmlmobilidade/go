'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { RideNormalized } from '@/types/normalized';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface RidesListContextState {
	data: {
		filtered: RideNormalized[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const RidesListContext = createContext<RidesListContextState | undefined>(undefined);

export function useRidesListContext() {
	const context = useContext(RidesListContext);
	if (!context) {
		throw new Error('useRidesListContext must be used within a RidesListContextProvider');
	}
	return context;
}

/* * */

export const RidesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	//
	// B. Define context value

	const filteredRides = useMemo(() => {
		const result = Array.from(ridesContext.data.normalized.values());
		return result
			.sort((a, b) => a.agency_id.localeCompare(b.agency_id))
			.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);
	}, [ridesContext.data.normalized]);

	//
	// C. Define context value

	const contextValue: RidesListContextState = useMemo(() => ({
		data: {
			filtered: filteredRides,
		},
		flags: {
			error: ridesContext.flags.error,
			loading: ridesContext.flags.loading,
		},
	}), [
		filteredRides,
		ridesContext.flags.error,
		ridesContext.flags.loading,
	]);

	//
	// D. Render components

	return (
		<RidesListContext.Provider value={contextValue}>
			{children}
		</RidesListContext.Provider>
	);

	//
};

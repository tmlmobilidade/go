/* eslint-disable @typescript-eslint/naming-convention */
'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { fetchData } from '@tmlmobilidade/utils';
/* * */

import { createContext, type PropsWithChildren, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface RidePinsContextState {
	actions: {
		addPin: (rideId: string) => Promise<void>
		removePin: (rideId: string) => Promise<void>
	}
	data: {
		pins: string[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const RidePinsContext = createContext<RidePinsContextState | undefined>(undefined);

export function useRidePinsContext() {
	const context = useContext(RidePinsContext);
	if (!context) {
		throw new Error('useRidePinsContext must be used within a RidePinsContextProvider');
	}
	return context;
}

/* * */

export const RidePinsContextProvider = ({ children }: PropsWithChildren) => {
	//

	const { data: pins = [], error: pinsError, isLoading: pinsLoading, mutate } = useSWR<string[], Error>(API_ROUTES.auth.PINS_CONTROLLER);

	//
	// B. Handle actions

	const addPin = async (rideId: string) => {
		const response = await fetchData<string[]>(API_ROUTES.auth.PINS_CONTROLLER_ADD, 'POST', { rideId });
		if (response.data) await mutate(response.data);
	};

	const removePin = async (rideId: string) => {
		const response = await fetchData<string[]>(API_ROUTES.auth.PINS_CONTROLLER_REMOVE, 'PUT', { rideId });
		if (response.data) await mutate(response.data);
	};

	//
	// C. Define context value

	const contextValue: RidePinsContextState = {
		actions: {
			addPin,
			removePin,
		},
		data: {
			pins,
		},
		flags: {
			error: pinsError ?? null,
			loading: pinsLoading,
		},
	};

	//
	// D. Render components

	return (
		<RidePinsContext.Provider value={contextValue}>
			{children}
		</RidePinsContext.Provider>
	);

	//
};

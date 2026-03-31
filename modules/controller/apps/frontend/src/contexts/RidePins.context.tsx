'use client';

import { useUserPreference } from '@tmlmobilidade/ui';
/* * */

import { createContext, type PropsWithChildren, useContext } from 'react';

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

	const [pins, setPins] = useUserPreference<string[]>('ride', 'controller', []);

	//
	// B. Handle actions

	const handleAddPin = async (rideId: string) => {
		const pinId = rideId.trim();
		if (!pinId) return;
		if (pins.includes(pinId)) return;
		setPins([...pins, pinId]);
	};

	const handleRemovePin = async (rideId: string) => {
		const pinId = rideId.trim();
		if (!pinId) return;
		setPins(pins.filter(existingPinId => existingPinId !== pinId));
	};

	//
	// C. Define context value

	const contextValue: RidePinsContextState = {
		actions: {
			addPin: handleAddPin,
			removePin: handleRemovePin,
		},
		data: {
			pins,
		},
		flags: {
			error: null,
			loading: false,
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

'use client';

import { useUserPreference } from '@tmlmobilidade/ui';
/* * */

import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

interface RideFavoritesContextState {
	actions: {
		toggleFavorite: (rideId: string) => Promise<void>
	}
	data: {
		favorites: string[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const RideFavoritesContext = createContext<RideFavoritesContextState | undefined>(undefined);

export function useRideFavoritesContext() {
	const context = useContext(RideFavoritesContext);
	if (!context) {
		throw new Error('useRideFavoritesContext must be used within a RideFavoritesContextProvider');
	}
	return context;
}

/* * */

export const RideFavoritesContextProvider = ({ children }: PropsWithChildren) => {
	//

	const [favorites, setFavorites] = useUserPreference<string[]>('controller', 'favorite_rides', []);

	//
	// B. Handle actions

	const handleToggleFavorite = async (rideId: string) => {
		if (!rideId) return;
		if (favorites.includes(rideId)) {
			setFavorites(favorites.filter(existingRideId => existingRideId !== rideId));
		} else {
			setFavorites([...favorites, rideId]);
		}
	};

	//
	// C. Define context value

	const contextValue: RideFavoritesContextState = {
		actions: {
			toggleFavorite: handleToggleFavorite,
		},
		data: {
			favorites,
		},
		flags: {
			error: null,
			loading: false,
		},
	};

	//
	// D. Render components

	return (
		<RideFavoritesContext.Provider value={contextValue}>
			{children}
		</RideFavoritesContext.Provider>
	);

	//
};

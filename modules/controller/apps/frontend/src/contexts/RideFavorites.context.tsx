'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideNormalized } from '@tmlmobilidade/types';
import { useUserPreference } from '@tmlmobilidade/ui';
/* * */

import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

/* * */

interface RideFavoritesContextState {
	actions: {
		mutateFavoriteRides: () => Promise<RideNormalized[] | undefined>
		toggleFavorite: (rideId: string) => Promise<void>
	}
	data: {
		favoriteRides: RideNormalized[]
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
	const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
	const { mutate: mutateCache } = useSWRConfig();

	const getFavoriteRidesSWRKey = (favoriteIds: string[]) => favoriteIds.length ? `${API_ROUTES.controller.RIDES_FAVORITES}?ids=${favoriteIds.join(',')}` : null;
	const favoritesIdsQuery = useMemo(() => favorites.join(','), [favorites]);
	const favoriteRidesKey = favorites.length ? `${API_ROUTES.controller.RIDES_FAVORITES}?ids=${favoritesIdsQuery}` : null;
	const { data: favoriteRidesData, error: favoriteRidesError, isLoading: favoriteRidesLoading, mutate: mutateFavoriteRides } = useSWR<RideNormalized[], Error>(favoriteRidesKey);

	//
	// B. Handle actions

	const handleToggleFavorite = async (rideId: string) => {
		if (!rideId) return;
		setIsTogglingFavorite(true);
		const nextFavorites = favorites.includes(rideId) ? favorites.filter(existingRideId => existingRideId !== rideId) : [...favorites, rideId];
		try {
			// Update local preferences immediately so all consumers react optimistically.
			setFavorites(nextFavorites);
			const nextFavoriteRidesKey = getFavoriteRidesSWRKey(nextFavorites);
			if (!nextFavoriteRidesKey) {
				await mutateFavoriteRides([], { revalidate: false });
				return;
			}
			await mutateCache(nextFavoriteRidesKey);
		} finally {
			setIsTogglingFavorite(false);
		}
	};

	//
	// C. Define context value

	const contextValue: RideFavoritesContextState = {
		actions: {
			mutateFavoriteRides: async () => mutateFavoriteRides(),
			toggleFavorite: handleToggleFavorite,
		},
		data: {
			favoriteRides: favoriteRidesData ?? [],
			favorites,
		},
		flags: {
			error: favoriteRidesError ?? null,
			loading: isTogglingFavorite || favoriteRidesLoading,
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

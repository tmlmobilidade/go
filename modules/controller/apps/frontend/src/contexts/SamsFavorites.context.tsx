'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Sam } from '@tmlmobilidade/types';
import { useUserPreference } from '@tmlmobilidade/ui';
/* * */

import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

/* * */

interface SamsFavoritesContextState {
	actions: {
		mutateFavoriteSams: () => Promise<Sam[] | undefined>
		toggleFavorite: (samId: string) => Promise<void>
	}
	data: {
		favorites: string[]
		favoriteSams: Sam[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const SamsFavoritesContext = createContext<SamsFavoritesContextState | undefined>(undefined);

export function useSamsFavoritesContext() {
	const context = useContext(SamsFavoritesContext);
	if (!context) {
		throw new Error('useSamsFavoritesContext must be used within a SamsFavoritesContextProvider');
	}
	return context;
}

/* * */

export const SamsFavoritesContextProvider = ({ children }: PropsWithChildren) => {
	//

	const [favorites, setFavorites] = useUserPreference<string[]>('controller', 'favorite_sams', []);
	const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
	const { mutate: mutateCache } = useSWRConfig();

	const getFavoriteSamsSWRKey = (favoriteIds: string[]) => favoriteIds.length ? `${API_ROUTES.controller.SAMS_FAVORITES}?ids=${favoriteIds.join(',')}` : null;
	const favoritesIdsQuery = useMemo(() => favorites.join(','), [favorites]);
	const favoriteSamsKey = favorites.length ? `${API_ROUTES.controller.SAMS_FAVORITES}?ids=${favoritesIdsQuery}` : null;
	const { data: favoriteSamsData, error: favoriteSamsError, isLoading: favoriteSamsLoading, mutate: mutateFavoriteSams } = useSWR<Sam[], Error>(favoriteSamsKey);

	console.log('favoriteSamsKey', favoriteSamsKey);
	console.log('favoriteSamsData', favoriteSamsData);
	//
	// B. Handle actions

	const handleToggleFavorite = async (samId: string) => {
		if (!samId) return;
		setIsTogglingFavorite(true);
		const nextFavorites = favorites.includes(samId) ? favorites.filter(existingSamId => existingSamId !== samId) : [...favorites, samId];
		try {
			// Update local preferences immediately so all consumers react optimistically.
			setFavorites(nextFavorites);
			const nextFavoriteSamsKey = getFavoriteSamsSWRKey(nextFavorites);
			if (!nextFavoriteSamsKey) {
				await mutateFavoriteSams([], { revalidate: false });
				return;
			}
			await mutateCache(nextFavoriteSamsKey);
		} finally {
			setIsTogglingFavorite(false);
		}
	};

	//
	// C. Define context value

	const contextValue: SamsFavoritesContextState = {
		actions: {
			mutateFavoriteSams: async () => mutateFavoriteSams(),
			toggleFavorite: handleToggleFavorite,
		},
		data: {
			favorites,
			favoriteSams: favoriteSamsData ?? [],
		},
		flags: {
			error: favoriteSamsError ?? null,
			loading: isTogglingFavorite || favoriteSamsLoading,
		},
	};

	//
	// D. Render components

	return (
		<SamsFavoritesContext.Provider value={contextValue}>
			{children}
		</SamsFavoritesContext.Provider>
	);

	//
};

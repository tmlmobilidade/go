'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type User } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useMeData } from '@tmlmobilidade/ui';
import { useCallback, useMemo, useState } from 'react';
import { mutate as globalMutate } from 'swr';

/* * */

interface UseRidesFavoritesDataReturnType {
	data: string[]
	isLoading: boolean
	toggleFavorite: (rideId: string) => Promise<void>
}

/* * */

function getFavoriteRideIds(meData: undefined | User): string[] {
	const value = meData?.preferences?.controller?.favorite_rides;
	if (!Array.isArray(value)) return [];
	return value.filter((id): id is string => typeof id === 'string');
}

/* * */

export function useRidesFavoritesData(): UseRidesFavoritesDataReturnType {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();
	const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

	const favorites = useMemo(() => getFavoriteRideIds(meData), [meData]);

	//
	// B. Handle actions

	const toggleFavorite = useCallback(async (rideId: string) => {
		if (!rideId || !meData) return;
		setIsTogglingFavorite(true);

		const nextFavorites = favorites.includes(rideId)
			? favorites.filter(existingRideId => existingRideId !== rideId)
			: [...favorites, rideId];

		const nextMeResponse = {
			data: { ...meData, preferences: { ...meData.preferences, controller: { ...meData.preferences?.controller, favorite_rides: nextFavorites } } },
			error: null,
		} as ApiResponse<User>;

		try {
			// Optimistic update shared across all consumers via the me SWR cache
			await globalMutate(API_ROUTES.core.ME_LIST, nextMeResponse, { revalidate: false });

			const response = await fetchApiData<User>({
				body: { key: 'favorite_rides', scope: 'controller', value: nextFavorites },
				method: 'PUT',
				url: API_ROUTES.core.ME_UPDATE_PREFERENCES,
			});

			if (response.data) {
				await globalMutate(API_ROUTES.core.ME_LIST, {
					...nextMeResponse,
					data: response.data,
				} as ApiResponse<User>, { revalidate: false });
			}
		} finally {
			setIsTogglingFavorite(false);
		}
	}, [favorites, meData]);

	//
	// C. Return data

	return useMemo(() => ({
		data: favorites,
		isLoading: isTogglingFavorite,
		toggleFavorite,
	}), [favorites, isTogglingFavorite, toggleFavorite]);
}

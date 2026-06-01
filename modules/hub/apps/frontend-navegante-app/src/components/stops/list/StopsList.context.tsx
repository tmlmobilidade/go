'use client';

import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/components/stops/Stops.context';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubStop } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, type MapOverlayMultipleStopsDataProps, useFilterStateString, useLocalStorage, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface StopsListContextState extends ListContextStateTemplate {
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>
		filtered: HubStop[]
	}
	view: {
		current: 'list' | 'map'
		toggle: (view: 'list' | 'map') => void
	}
}

/* * */

const StopsListContext = createContext<StopsListContextState | undefined>(undefined);

export function useStopsListContext() {
	const context = useContext(StopsListContext);
	if (!context) {
		throw new Error('useStopsListContext must be used within a StopsListContextProvider');
	}
	return context;
}

/* * */

export function StopsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();

	const filterSearch = useFilterStateString('search');

	const [currentView, setCurrentView] = useLocalStorage<'list' | 'map'>({
		defaultValue: 'list',
		key: 'stops-current-view',
	});

	//
	// B. Transform data

	const searchResultsData = useSearch<HubStop>({
		accessors: ['name', 'short_name', 'tts_name'],
		data: stopsContext.data.stops,
		query: filterSearch.value,
	});

	const dataFeatureCollection = useMemo(() => {
		// Check if all data is available
		if (!searchResultsData?.length) return getBaseGeoJsonFeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>();
		// Initialize worker if not already initialized
		const collection: GeoJSON.FeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps> = getBaseGeoJsonFeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>();
		searchResultsData.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push({
				...stopFC,
				properties: {
					id: String(stop._id),
					name: stop.name,
				},
			});
		});
		return collection;
	}, [searchResultsData]);

	//
	// C. Define context value

	const contextValue: StopsListContextState = {
		data: {
			fc: dataFeatureCollection,
			filtered: searchResultsData,
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: stopsContext.flags.isLoading,
		},
		view: {
			current: currentView,
			toggle: setCurrentView,
		},
	};

	//
	// D. Render components

	return (
		<StopsListContext.Provider value={contextValue}>
			{children}
		</StopsListContext.Provider>
	);
};

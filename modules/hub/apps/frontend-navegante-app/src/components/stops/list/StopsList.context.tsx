'use client';

import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/components/stops/Stops.context';
import { useTransitModes } from '@/hooks/use-transit-modes';
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
		showVehicles: boolean
		toggleShowVehicles: () => void
		toggleView: () => void
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

	const { activeAgencyIds } = useTransitModes();

	const filterSearch = useFilterStateString('search');

	const [currentView, setCurrentView] = useLocalStorage<'list' | 'map'>({
		defaultValue: 'list',
		key: 'stops-current-view',
	});

	const [showVehicles, setShowVehicles] = useLocalStorage<boolean>({
		defaultValue: true,
		key: 'stops-show-vehicles',
	});

	//
	// B. Transform data

	const searchResultsData = useSearch<HubStop>({
		accessors: ['name', 'short_name', 'tts_name'],
		data: stopsContext.data.stops,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		return searchResultsData?.filter((stop) => {
			return activeAgencyIds.some(agencyId => stop.agency_ids?.includes(agencyId));
		});
	}, [searchResultsData, activeAgencyIds]);

	const dataFeatureCollection = useMemo(() => {
		// Check if all data is available
		if (!filteredData?.length) return getBaseGeoJsonFeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>();
		// Initialize worker if not already initialized
		const collection: GeoJSON.FeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps> = getBaseGeoJsonFeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>();
		filteredData.forEach((stop) => {
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
	}, [filteredData]);

	//
	// C. Handle actions

	const toggleView = () => {
		setCurrentView(prev => prev === 'list' ? 'map' : 'list');
	};

	const toggleShowVehicles = () => {
		setShowVehicles(prev => !prev);
	};

	//
	// C. Define context value

	const contextValue: StopsListContextState = {
		data: {
			fc: dataFeatureCollection,
			filtered: filteredData,
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
			showVehicles: showVehicles,
			toggleShowVehicles: toggleShowVehicles,
			toggleView: toggleView,
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

'use client';

import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/components/stops/Stops.context';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubStop } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, type MapOverlayMultipleStopsDataProps, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const CM_AGENCY_IDS = new Set(['41', '42', '43', '44']);

/* * */

interface StopsListContextState extends ListContextStateTemplate {
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Point, MapOverlayMultipleStopsDataProps>
		filtered: HubStop[]
	}
	filters: {
		agency: UseFilterStateStringReturnType
		search: UseFilterStateStringReturnType
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
	const filterAgency = useFilterStateString('agency');

	//
	// B. Transform data

	const searchResultsData = useSearch<HubStop>({
		accessors: ['name', 'short_name', 'tts_name'],
		data: stopsContext.data.stops,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		if (!filterAgency.value) return searchResultsData;
		return (searchResultsData ?? []).filter((stop) => {
			return stop.agency_ids.some((id) => {
				const normalized = CM_AGENCY_IDS.has(id) ? 'CM' : id;
				return normalized === filterAgency.value;
			});
		});
	}, [filterAgency.value, searchResultsData]);

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
	// C. Define context value

	const contextValue: StopsListContextState = {
		data: {
			fc: dataFeatureCollection,
			filtered: filteredData,
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
		},
		flags: {
			error: undefined,
			isLoading: stopsContext.flags.isLoading,
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

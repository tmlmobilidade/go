'use client';

/* * */

import { transformStopDataIntoGeoJsonFeature } from '@/contexts/Stops.context';
import { swrFetcher } from '@/lib/http';
import { Stop } from '@tmlmobilidade/types';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/ui';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface StopsListContextState {
	actions: {
		handleDBSync?: () => void
	// changePublishDateEnd: (date: Date | null) => void
	// changePublishDateStart: (date: Date | null) => void
	// changeSearchQuery: (query: string) => void
	// changeValidityDateEnd: (date: Date | null) => void
	// changeValidityDateStart: (date: Date | null) => void
	// toggleCause: (cause: string) => void
	// toggleEffect: (effect: string) => void
	// toggleLine: (line: string) => void
	// toggleMunicipality: (municipality: string) => void
	// togglePublishStatus: (status: string) => void
	// toggleStop: (stop: string) => void
	}
	data: {
		filtered_fc: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
		// filtered: Alert[]
		raw: Stop[]
	}
	// filters: {
	// cause: string[]
	// effect: string[]
	// line: string[]
	// lineOptions: string[]
	// municipality: string[]
	// municipalityOptions: string[]
	// publish_status: string[]
	// publishDateEnd: Date | null
	// publishDateStart: Date | null
	// searchQuery: string
	// stop: string[]
	// stopOptions: string[]
	// validityDateEnd: Date | null
	// validityDateStart: Date | null
	// }
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const StopsListContext = createContext<StopsListContextState | undefined>(undefined);

export const useStopsListContext = () => {
	const context = useContext(StopsListContext);
	if (!context) {
		throw new Error('useStopsListContext must be used within an StopsListContextProvider');
	}
	return context;
};

/* * */

export const StopsListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const [dataFilteredGeojsonFCState, setDataFilteredGeojsonFCState] = useState<GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>>(getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>);

	//
	// B. Fetch data

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[], Error>('/api/stops', swrFetcher);

	//
	// C. Transform data

	const handleDBSync = () => {
		mutate('/api/stops');
	};

	const rawStops = useMemo(() => {
		return allStopsData || [];
	}, [allStopsData]);

	const geoStops = useMemo(() => {
		return dataFilteredGeojsonFCState || (getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>);
	}, [dataFilteredGeojsonFCState]);

	useEffect(() => {
		// Check if all data is available
		// if (!dataFilteredState) return;
		if (!allStopsData) return;
		// Initialize worker if not already initialized
		const collection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> = getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>;
		allStopsData.map((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			// console.log('stopFC', stopFC);
			if (stopFC) collection.features.push(stopFC);
		});
		// Set state value
		setDataFilteredGeojsonFCState(collection);
		//
	}, [allStopsData]);

	//
	// E. Define context value

	const contextValue: StopsListContextState = useMemo(() => ({
		actions: {
			handleDBSync,
		},
		data: {
			// filtered: filteredAlerts || [],
			filtered_fc: geoStops || (getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>),
			raw: rawStops || [],
		},
		filters: {
			// cause: filterCause,
			// effect: filterEffect,
			// line: filterLine,
			// lineOptions: lineOptions,
			// municipality: filterMunicipality,
			// municipalityOptions: municipalityOptions,
			// publish_status: filterPublishStatus,
			// publishDateEnd: filterPublishDateEnd,
			// publishDateStart: filterPublishDateStart,
			// searchQuery: searchQuery || '',
			// stop: filterStop,
			// stopOptions: stopOptions,
			// validityDateEnd: filterValidityDateEnd,
			// validityDateStart: filterValidityDateStart,
		},
		flags: {
			error: allStopsError,
			isLoading: allStopsLoading,
		},
	}), [
		rawStops,
		geoStops,
		allStopsError,
		allStopsLoading,
		// filteredAlerts,
		// allAlertsData,
		// allAlertsLoading,
		// allAlertsError,
		// filterPublishStatus,
		// filterCause,
		// filterEffect,
		// filterMunicipality,
		// municipalityOptions,
		// filterLine,
		// lineOptions,
		// filterStop,
		// stopOptions,
		// filterValidityDateStart,
		// filterValidityDateEnd,
		// filterPublishDateStart,
		// filterPublishDateEnd,
		// searchQuery,
	]);

	//
	// F. Render components

	return (
		<StopsListContext.Provider value={contextValue}>
			{children}
		</StopsListContext.Provider>
	);

	//
};

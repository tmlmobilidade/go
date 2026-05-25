'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

/* * */

import { getBaseGeoJsonFeatureCollection, parseCoordinatePairString } from '@tmlmobilidade/geo';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type FeatureCollection, type Point } from 'geojson';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { MapStyle } from '../components/map/configs/styles';
import { MapOverlayPinsPointDataProps } from '../components/map/overlays/MapOverlayPins';
import { useUserPreference } from '../hooks';

/* * */

interface MapContextState {
	actions: {
		handleSearch: (value: string) => void
		toggleScrollZoom: (value?: boolean) => void
		toggleStyle: (value?: MapStyle) => void
	}
	data: {
		search: string
		search_pin: FeatureCollection<Point, MapOverlayPinsPointDataProps>
	}
	flags: {
		scroll_zoom: boolean
		style: MapStyle
	}
}

/* * */

const MapContext = createContext<MapContextState | undefined>(undefined);

export function useMapContext() {
	const context = useContext(MapContext);
	if (!context) {
		throw new Error('useMapContext must be used within a MapContextProvider');
	}
	return context;
}

/* * */

interface MapContextProviderProps extends PropsWithChildren {
	/** Isolates search / style preferences from other maps (e.g. modal vs page). Default `'map'`. */
	preferenceScope?: string
}

export const MapContextProvider = ({ children, preferenceScope = 'map' }: MapContextProviderProps) => {
	//

	//
	// A. Setup variables

	const [dataSearch, setDataSearch] = useUserPreference<string>(preferenceScope, 'data:search', '');
	const [flagStyle, setFlagStyle] = useUserPreference<MapStyle>(preferenceScope, 'flags:style', 'map');
	const [flagScrollZoom, setFlagScrollZoom] = useUserPreference<boolean>(preferenceScope, 'flags:scroll-zoom', true);

	//
	// B. Transform data

	const searchPinFC = useMemo(() => {
		// Prepare an empty feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		// Parse the coordinates from the search value
		const parsedCoordinates = parseCoordinatePairString(dataSearch);
		// Skip if coordinates are invalid or not found
		if (!parsedCoordinates) return baseGeoJson;
		// Add the features to the base GeoJSON
		baseGeoJson.features = [{
			geometry: {
				coordinates: [parsedCoordinates.lng, parsedCoordinates.lat],
				type: 'Point',
			},
			properties: {
				id: 'search-query',
			},
			type: 'Feature',
		}];
		// Return the collection
		return baseGeoJson;
	}, [dataSearch]);

	//
	// B. Handle actions

	const toggleScrollZoom = (value?: boolean) => {
		if (value !== undefined) setFlagScrollZoom(value);
		else setFlagScrollZoom(!flagScrollZoom);
	};

	const toggleStyle = (value?: MapStyle) => {
		if (value) setFlagStyle(value);
		else setFlagStyle(flagStyle === 'map' ? 'satellite' : 'map');
	};

	const handleSearch = (value: string) => {
		setDataSearch(value);
	};

	//
	// C. Define context value

	const contextValue: MapContextState = useMemo(() => ({
		actions: {
			handleSearch,
			toggleScrollZoom,
			toggleStyle,
		},
		data: {
			search: dataSearch,
			search_pin: searchPinFC,
		},
		flags: {
			scroll_zoom: flagScrollZoom,
			style: flagStyle,
		},
	}), [
		dataSearch,
		searchPinFC,
		flagScrollZoom,
		flagStyle,
	]);

	//
	// D. Render components

	return (
		<MapContext.Provider value={contextValue}>
			<MapProvider>
				{children}
			</MapProvider>
		</MapContext.Provider>
	);

	//
};

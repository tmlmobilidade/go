'use client';

/* * */

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
		handleSearchCoordinates: (value: [number, number] | null) => void
		toggleScrollZoom: (value?: boolean) => void
		toggleStyle: (value?: MapStyle) => void
	}
	data: {
		search_coordinates: [number, number] | null
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

export const MapContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [dataSearchCoordinates, setDataSearchCoordinates] = useUserPreference<[number, number] | null>('map', 'data:search-coordinates', null);
	const [flagStyle, setFlagStyle] = useUserPreference<MapStyle>('map', 'flags:style', 'map');
	const [flagScrollZoom, setFlagScrollZoom] = useUserPreference<boolean>('map', 'flags:scroll-zoom', true);

	//
	// B. Transform data

	const searchPinFC = useMemo(() => {
		// Prepare an empty feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		// Parse the coordinates from the search value
		// Skip if coordinates are invalid or not found
		if (!dataSearchCoordinates) return baseGeoJson;
		// Add the features to the base GeoJSON
		const [lat, lon] = dataSearchCoordinates;
		baseGeoJson.features = [{
			geometry: {
				coordinates: [lon, lat], // GeoJSON Position is [longitude, latitude]
				type: 'Point',
			},
			properties: {
				id: 'search-query',
			},
			type: 'Feature',
		}];
		// Return the collection
		return baseGeoJson;
	}, [dataSearchCoordinates]);

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

	const handleSearchCoordinates = (value: [number, number] | null) => {
		if (value === null) {
			setDataSearchCoordinates(null);
			return;
		}
		const [lat, lon] = value;
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
		if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
		setDataSearchCoordinates([lat, lon]);
	};

	//
	// C. Define context value

	const contextValue: MapContextState = useMemo(() => ({
		actions: {
			handleSearchCoordinates,
			toggleScrollZoom,
			toggleStyle,
		},
		data: {
			search_coordinates: dataSearchCoordinates,
			search_pin: searchPinFC,
		},
		flags: {
			scroll_zoom: flagScrollZoom,
			style: flagStyle,
		},
	}), [
		dataSearchCoordinates,
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

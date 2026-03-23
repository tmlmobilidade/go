'use client';

/* * */

import 'maplibre-gl/dist/maplibre-gl.css';

/* * */

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type FeatureCollection, type Point } from 'geojson';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

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
		search_coordinates: [number, number] | undefined
		search_pin: FeatureCollection<Point, MapOverlayPinsPointDataProps> | null
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

	const [dataSearchCoordinates, setDataSearchCoordinates] = useUserPreference<[number, number] | undefined>('map', 'data:search-coordinates', undefined);
	const [flagStyle, setFlagStyle] = useUserPreference<MapStyle>('map', 'flags:style', 'map');
	const [flagScrollZoom, setFlagScrollZoom] = useUserPreference<boolean>('map', 'flags:scroll-zoom', true);

	//
	// B. Transform data

	const searchPinFC = useMemo((): FeatureCollection<Point, MapOverlayPinsPointDataProps> | null => {
		if (dataSearchCoordinates === undefined) return null;
		if (!Array.isArray(dataSearchCoordinates) || dataSearchCoordinates.length < 2) return null;
		const [lat, lon] = dataSearchCoordinates;
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
		if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
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
		return baseGeoJson;
	}, [dataSearchCoordinates]);

	//
	// B. Handle actions

	const toggleScrollZoom = useCallback((value?: boolean) => {
		if (value !== undefined) setFlagScrollZoom(value);
		else setFlagScrollZoom(!flagScrollZoom);
	}, [flagScrollZoom, setFlagScrollZoom]);

	const toggleStyle = useCallback((value?: MapStyle) => {
		if (value !== undefined) {
			setFlagStyle(value);
			return;
		}
		setFlagStyle(flagStyle === 'map' ? 'satellite' : 'map');
	}, [flagStyle, setFlagStyle]);

	const handleSearchCoordinates = useCallback((value: [number, number] | null) => {
		if (value === null) {
			setDataSearchCoordinates(undefined);
			return;
		}
		const [lat, lon] = value;
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
		if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
		setDataSearchCoordinates([lat, lon]);
	}, [setDataSearchCoordinates]);

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
		handleSearchCoordinates,
		searchPinFC,
		flagScrollZoom,
		flagStyle,
		toggleScrollZoom,
		toggleStyle,
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

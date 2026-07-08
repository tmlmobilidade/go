'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

/* * */

import { getBaseGeoJsonFeatureCollection, parseCoordinatePairString } from '@tmlmobilidade/geo';
import { MapProvider } from '@vis.gl/react-maplibre';
import { type FeatureCollection, type Point } from 'geojson';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

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
	/** Uses local state instead of persisted user preferences. Use this for public/anonymous surfaces. */
	anonymous?: boolean
	/** Isolates search / style preferences from other maps (e.g. modal vs page). Default `'map'`. */
	preferenceScope?: string
}

interface MapContextProviderInnerProps extends PropsWithChildren {
	dataSearch: string
	flagScrollZoom: boolean
	flagStyle: MapStyle
	setDataSearch: (value: string) => void
	setFlagScrollZoom: (value: boolean) => void
	setFlagStyle: (value: MapStyle) => void
}

function MapContextProviderInner({ children, dataSearch, flagScrollZoom, flagStyle, setDataSearch, setFlagScrollZoom, setFlagStyle }: MapContextProviderInnerProps) {
	//

	//
	// A. Transform data

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

	const toggleScrollZoom = useCallback((value?: boolean) => {
		if (value !== undefined) setFlagScrollZoom(value);
		else setFlagScrollZoom(!flagScrollZoom);
	}, [flagScrollZoom, setFlagScrollZoom]);

	const toggleStyle = useCallback((value?: MapStyle) => {
		if (value) setFlagStyle(value);
		else setFlagStyle(flagStyle === 'map' ? 'satellite' : 'map');
	}, [flagStyle, setFlagStyle]);

	const handleSearch = useCallback((value: string) => {
		setDataSearch(value);
	}, [setDataSearch]);

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
		handleSearch,
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
}

function AnonymousMapContextProvider(props: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [dataSearch, setDataSearch] = useState('');
	const [flagStyle, setFlagStyle] = useState<MapStyle>('map');
	const [flagScrollZoom, setFlagScrollZoom] = useState(true);

	//
	// B. Render components

	return (
		<MapContextProviderInner
			dataSearch={dataSearch}
			flagScrollZoom={flagScrollZoom}
			flagStyle={flagStyle}
			setDataSearch={setDataSearch}
			setFlagScrollZoom={setFlagScrollZoom}
			setFlagStyle={setFlagStyle}
		>
			{props.children}
		</MapContextProviderInner>
	);
}

function AuthenticatedMapContextProvider({ children, preferenceScope }: Required<PropsWithChildren<Pick<MapContextProviderProps, 'preferenceScope'>>>) {
	//

	//
	// A. Setup variables

	const [dataSearch, setDataSearch] = useUserPreference<string>(preferenceScope, 'data:search', '');
	const [flagStyle, setFlagStyle] = useUserPreference<MapStyle>(preferenceScope, 'flags:style', 'map');
	const [flagScrollZoom, setFlagScrollZoom] = useUserPreference<boolean>(preferenceScope, 'flags:scroll-zoom', true);

	//
	// B. Render components

	return (
		<MapContextProviderInner
			dataSearch={dataSearch}
			flagScrollZoom={flagScrollZoom}
			flagStyle={flagStyle}
			setDataSearch={setDataSearch}
			setFlagScrollZoom={setFlagScrollZoom}
			setFlagStyle={setFlagStyle}
		>
			{children}
		</MapContextProviderInner>
	);
}

export const MapContextProvider = ({ anonymous = false, children, preferenceScope = 'map' }: MapContextProviderProps) => {
	if (anonymous) {
		return (
			<AnonymousMapContextProvider>
				{children}
			</AnonymousMapContextProvider>
		);
	}

	return (
		<AuthenticatedMapContextProvider preferenceScope={preferenceScope}>
			{children}
		</AuthenticatedMapContextProvider>
	);
};

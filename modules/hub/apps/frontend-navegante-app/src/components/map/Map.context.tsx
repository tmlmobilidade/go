'use client';

import { type MapStyle } from '@/components/map/MapView';
import * as turf from '@turf/turf';
import { type MapRef } from '@vis.gl/react-maplibre';
import maplibregl from 'maplibre-gl';
import { createContext, type PropsWithChildren, useContext, useState } from 'react';

/* * */

interface MapContextState {
	actions: {
		centerMap: (source?: string) => void
		setMap: (map: MapRef) => void
		setStyle: (value: MapStyle) => void
	}
	data: {
		map: MapRef | undefined
		style: string
	}
	flags: {
		isLoading: boolean
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

export function MapContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [dataStyleState, setDataStyleState] = useState<MapContextState['data']['style']>('map');
	const [dataMapState, setDataMapState] = useState<MapContextState['data']['map']>(undefined);

	//
	// B. Handle actions

	const setStyle = (value: MapStyle) => {
		setDataStyleState(value);
	};

	const setMap = (map: MapRef) => {
		setDataMapState(map);
	};

	const centerMap = (sourceId: string) => {
		if (!dataMapState || !sourceId) return;

		const sourceData = dataMapState.getSource(sourceId);
		if (!sourceData) return;

		const combine = turf.combine(sourceData.serialize().data);
		const coordinates = combine.features[0].geometry.coordinates;

		// Calculate bounds
		const bounds = coordinates.reduce((bounds, coord) => {
			return bounds.extend(coord as [number, number]);
		}, new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

		dataMapState.fitBounds(
			bounds,
			{ padding: 25 },
		);

		// return;
	};

	//
	// C. Define context value

	const contextValue: MapContextState = {
		actions: {
			centerMap,
			setMap,
			setStyle,
		},
		data: {
			map: dataMapState,
			style: dataStyleState,
		},
		flags: {
			isLoading: false,
		},
	};

	//
	// D. Render components

	return (
		<MapContext.Provider value={contextValue}>
			{children}
		</MapContext.Provider>
	);
}

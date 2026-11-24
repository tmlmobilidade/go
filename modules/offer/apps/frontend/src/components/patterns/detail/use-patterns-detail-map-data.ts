'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Pattern } from '@tmlmobilidade/go-types-offer';
import { type MapOverlayPatternShapeLineData, type MapOverlayPatternShapeLineDataProps, type MapOverlayPatternShapeStopsDataProps } from '@tmlmobilidade/ui';
import { type FeatureCollection, type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

interface UsePatternsDetailMapDataOptions {
	color?: string
	path: PatternsDetailPathItem[]
	patternId: string
	shape: null | Pattern['shape'] | undefined
}

interface UsePatternsDetailMapDataReturnType {
	patternLineFC: MapOverlayPatternShapeLineData | null
	patternStopsFC: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps>
}

/* * */

/** Project the unsaved form path/shape onto the map; never fall back to the persisted geometry. */
export function usePatternsDetailMapData({ color, path, patternId, shape }: UsePatternsDetailMapDataOptions): UsePatternsDetailMapDataReturnType {
	//
	// A. Build the line and stop overlays

	const patternLineFC: MapOverlayPatternShapeLineData | null = useMemo(() => {
		const properties: MapOverlayPatternShapeLineDataProps = {
			color: color,
			id: patternId,
		};

		if (shape?.encoded_polyline) {
			return {
				encoded_polyline: shape.encoded_polyline,
				properties,
			};
		}

		if (!shape?.geojson?.geometry?.coordinates) return null;

		return {
			geometry: {
				coordinates: shape.geojson.geometry.coordinates,
				type: 'LineString' as const,
			},
			properties,
			type: 'Feature' as const,
		};
	}, [shape, color, patternId]);

	const patternStopsFC: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null = useMemo(() => {
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayPatternShapeStopsDataProps>();

		featureCollection.features = path
			.filter(pathItem => pathItem.stop)
			.map((pathItem, index) => ({
				geometry: {
					coordinates: [
						pathItem.stop.longitude,
						pathItem.stop.latitude,
					],
					type: 'Point' as const,
				},
				properties: {
					id: String(pathItem.stop._id),
					name: pathItem.stop.name,
					sequence: index + 1,
				},
				type: 'Feature' as const,
			}));

		return featureCollection;
	}, [path]);

	//
	// B. Return map data

	return useMemo(() => ({ patternLineFC, patternStopsFC }), [patternLineFC, patternStopsFC]);
}

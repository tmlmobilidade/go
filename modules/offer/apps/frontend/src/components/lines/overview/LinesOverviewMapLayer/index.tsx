'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { PatternShapeMapFeatureProperties } from '@/types/lines-overview';
import { lineFeatureFromEncodedPolyline } from '@tmlmobilidade/geo';
import { useMapViewContext } from '@tmlmobilidade/ui';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { FeatureCollection, LineString } from 'geojson';
import { useEffect, useMemo } from 'react';

/* * */

export function LinesOverviewMapLayer() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();
	const mapViewContext = useMapViewContext();
	const highlightedPatternIds = linesOverviewContext.data.highlightedPatternIds;

	//
	// B. Transform data

	const featureCollection = useMemo<FeatureCollection<LineString, PatternShapeMapFeatureProperties>>(() => ({
		features: (linesOverviewContext.data.patternsData ?? []).map((pattern) => {
			return lineFeatureFromEncodedPolyline<PatternShapeMapFeatureProperties>(
				pattern.encoded_polyline,
				{
					agency_id: pattern.agency_id,
					color: pattern.color,
					destination: pattern.destination,
					headsign: pattern.headsign,
					id: pattern.pattern_id,
					line_code: pattern.line_code,
					line_id: pattern.line_id,
					line_name: pattern.line_name,
					line_text_color: pattern.line_text_color,
					origin: pattern.origin,
					pattern_code: pattern.pattern_code,
					pattern_id: pattern.pattern_id,
					route_id: pattern.route_id,
				},
			);
		}),
		type: 'FeatureCollection',
	}), [linesOverviewContext.data.patternsData]);

	//
	// C. Handle actions

	useEffect(() => {
		if (!featureCollection.features.length) return;
		mapViewContext.actions.registerOverlaySource('lines-patterns-map:source', featureCollection);
		return () => {
			mapViewContext.actions.unregisterOverlaySource('lines-patterns-map:source');
		};
	}, [featureCollection, mapViewContext.actions]);

	if (!featureCollection.features.length) return null;

	//
	// D. Render components

	return (
		<Source data={featureCollection} id="lines-patterns-map:source" type="geojson" generateId>
			<Layer
				id="lines-patterns-map:shadow"
				source="lines-patterns-map:source"
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': '#000000',
					'line-opacity': 0.16,
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 16, 8],
				}}
			/>
			<Layer
				id="lines-patterns-map:line"
				source="lines-patterns-map:source"
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': ['coalesce', ['get', 'color'], '#1c7ed6'],
					'line-opacity': 0.86,
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.2, 16, 4.5],
				}}
			/>
			<Layer
				filter={['in', ['get', 'pattern_id'], ['literal', highlightedPatternIds]]}
				id="lines-patterns-map:highlight-casing"
				source="lines-patterns-map:source"
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': '#ffffff',
					'line-opacity': 0.95,
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 5, 16, 11],
				}}
			/>
			<Layer
				filter={['in', ['get', 'pattern_id'], ['literal', highlightedPatternIds]]}
				id="lines-patterns-map:highlight"
				source="lines-patterns-map:source"
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': ['coalesce', ['get', 'color'], '#1c7ed6'],
					'line-opacity': 1,
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 3, 16, 7],
				}}
			/>
			<Layer
				id={linesOverviewContext.data.hitboxLayerId}
				source="lines-patterns-map:source"
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': '#000000',
					'line-opacity': 0,
					'line-width': ['interpolate', ['linear'], ['zoom'], 8, 14, 16, 24],
				}}
			/>
		</Source>
	);

	//
}

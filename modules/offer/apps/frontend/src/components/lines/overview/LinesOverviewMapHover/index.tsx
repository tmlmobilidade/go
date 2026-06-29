'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { PatternShapeMapFeatureProperties } from '@/types/lines-overview';
import { areStringArraysEqual, getPatternFeaturesAtEvent } from '@/utils/lines-overview';
import { useMapViewContext } from '@tmlmobilidade/ui';
import { type MapMouseEvent, Marker } from '@vis.gl/react-maplibre';
import { useEffect, useRef } from 'react';

import styles from './styles.module.css';

/* * */

const HOVER_INTENT_DELAY_MS = 120;

/* * */

function getStackLabel(features: PatternShapeMapFeatureProperties[]) {
	const lineCount = new Set(features.map(feature => feature.line_id)).size;
	if (lineCount === features.length) return `${lineCount} ${lineCount === 1 ? 'linha' : 'linhas'}`;
	return `${features.length} ${features.length === 1 ? 'pattern' : 'patterns'} em ${lineCount} ${lineCount === 1 ? 'linha' : 'linhas'}`;
}

export function LinesOverviewMapHover() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();
	const mapViewContext = useMapViewContext();

	const hoverInfo = linesOverviewContext.data.hoverInfo;
	const hitboxLayerId = linesOverviewContext.data.hitboxLayerId;
	const popupInfo = linesOverviewContext.data.popupInfo;
	const setHighlightedPatternIds = linesOverviewContext.actions.setHighlightedPatternIds;
	const setHoverInfo = linesOverviewContext.actions.setHoverInfo;
	const lastHoverPatternIdsRef = useRef<string[]>([]);
	const pendingHoverPatternIdsRef = useRef<string[]>([]);
	const hoverIntentTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	const shouldRenderHover = hoverInfo && !popupInfo;

	//
	// B. Setup listeners

	useEffect(() => {
		if (mapViewContext.flags.loading) return;

		const mapRef = mapViewContext.ref.map.current;
		if (!mapRef) return;

		const clearHoverIntentTimeout = () => {
			if (!hoverIntentTimeoutRef.current) return;
			clearTimeout(hoverIntentTimeoutRef.current);
			hoverIntentTimeoutRef.current = null;
			pendingHoverPatternIdsRef.current = [];
		};

		const clearHoverState = () => {
			clearHoverIntentTimeout();

			if (!popupInfo && lastHoverPatternIdsRef.current.length) {
				lastHoverPatternIdsRef.current = [];
				setHighlightedPatternIds([]);
			}

			setHoverInfo(null);
		};

		const handleMouseMove = (event: MapMouseEvent) => {
			const features = getPatternFeaturesAtEvent(event, hitboxLayerId);
			if (!features.length) {
				clearHoverState();
				return;
			}

			const patternIds = features.map(feature => feature.pattern_id);
			const hasSamePatternIds = areStringArraysEqual(lastHoverPatternIdsRef.current, patternIds);

			if (hasSamePatternIds) {
				clearHoverIntentTimeout();
				setHoverInfo({
					features,
					latitude: event.lngLat.lat,
					longitude: event.lngLat.lng,
				});
				return;
			}

			if (areStringArraysEqual(pendingHoverPatternIdsRef.current, patternIds)) return;

			clearHoverIntentTimeout();
			pendingHoverPatternIdsRef.current = patternIds;

			hoverIntentTimeoutRef.current = setTimeout(() => {
				lastHoverPatternIdsRef.current = patternIds;
				pendingHoverPatternIdsRef.current = [];
				if (!popupInfo) setHighlightedPatternIds(patternIds);

				setHoverInfo({
					features,
					latitude: event.lngLat.lat,
					longitude: event.lngLat.lng,
				});
			}, HOVER_INTENT_DELAY_MS);
		};

		const handleMouseOut = () => {
			clearHoverState();
		};

		mapRef.on('mousemove', handleMouseMove);
		mapRef.on('mouseout', handleMouseOut);

		return () => {
			clearHoverIntentTimeout();
			mapRef.off('mousemove', handleMouseMove);
			mapRef.off('mouseout', handleMouseOut);
		};
	}, [hitboxLayerId, mapViewContext.flags.loading, mapViewContext.ref.map, popupInfo, setHighlightedPatternIds, setHoverInfo]);

	//
	// C. Render components

	if (!shouldRenderHover) return null;

	return (
		<Marker
			anchor="bottom"
			latitude={hoverInfo.latitude}
			longitude={hoverInfo.longitude}
			offset={[0, -12]}
		>
			<div className={styles.tooltip}>
				{getStackLabel(hoverInfo.features)}
				<div className={styles.tip} />
			</div>
		</Marker>

	);

	//
}

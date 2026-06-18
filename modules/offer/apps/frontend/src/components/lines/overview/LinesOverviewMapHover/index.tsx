'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { PatternShapeMapFeatureProperties } from '@/types/lines-overview';
import { getPatternFeaturesAtEvent } from '@/utils/lines-overview';
import { useMapViewContext } from '@tmlmobilidade/ui';
import { type MapMouseEvent, Marker } from '@vis.gl/react-maplibre';
import { useEffect } from 'react';

import styles from './styles.module.css';

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

	const shouldRenderHover = hoverInfo && !popupInfo;

	//
	// B. Setup listeners

	useEffect(() => {
		if (mapViewContext.flags.loading) return;

		const mapRef = mapViewContext.ref.map.current;
		if (!mapRef) return;

		const handleMouseMove = (event: MapMouseEvent) => {
			const features = getPatternFeaturesAtEvent(event, hitboxLayerId);
			if (!features.length) {
				if (!popupInfo) setHighlightedPatternIds([]);
				setHoverInfo(null);
				return;
			}

			if (!popupInfo) setHighlightedPatternIds(features.map(feature => feature.pattern_id));
			setHoverInfo({
				features,
				latitude: event.lngLat.lat,
				longitude: event.lngLat.lng,
			});
		};

		const handleMouseOut = () => {
			if (!popupInfo) setHighlightedPatternIds([]);
			setHoverInfo(null);
		};

		mapRef.on('mousemove', handleMouseMove);
		mapRef.on('mouseout', handleMouseOut);

		return () => {
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

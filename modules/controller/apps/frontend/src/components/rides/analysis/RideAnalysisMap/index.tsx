'use client';

/* * */

import { ReplayEvents } from '@/components/common/ReplayEvents';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Collapsible, Divider, MapOverlayGeofences, MapOverlayObservedPath, MapOverlayScheduledPath, MapView, Section, Switch } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RideAnalysisMap() {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	const observedEvents = rideAnalysisContext.geojson.observed_events;
	const observedShape = rideAnalysisContext.geojson.observed_shape;
	const eventCount = observedEvents.features.length;
	const showReplay = rideAnalysisContext.data.ride?.operational_status === 'ended' && eventCount > 0;

	const [replayIndex, setReplayIndex] = useState(0);

	useEffect(() => {
		setReplayIndex(i => Math.min(i, Math.max(0, eventCount - 1)));
	}, [eventCount]);

	const observedPointsData = useMemo(() => {
		if (!showReplay) return observedEvents;
		return {
			...observedEvents,
			features: observedEvents.features.slice(0, replayIndex + 1),
		};
	}, [showReplay, observedEvents, replayIndex]);

	const observedLineData = useMemo(() => {
		if (!showReplay) return observedShape;
		const lineFeature = observedShape.features[0];
		if (lineFeature?.geometry.type !== 'LineString') return observedShape;
		const fullCoords = lineFeature.geometry.coordinates;
		let coordinates = fullCoords.slice(0, replayIndex + 1);
		if (coordinates.length === 1) {
			const c = coordinates[0];
			coordinates = [c, c];
		}
		return {
			...observedShape,
			features: [
				{
					...lineFeature,
					geometry: {
						...lineFeature.geometry,
						coordinates,
					},
				},
			],
		};
	}, [showReplay, observedShape, replayIndex]);

	const [showScheduledPath, setShowScheduledPath] = useState(true);
	const [showObservedPath, setShowObservedPath] = useState(true);
	const [showGeofences, setShowGeofences] = useState(false);

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisMap.description')} title={t('default:rides.analysis.RideAnalysisMap.title')} defaultOpen>
			<div className={styles.mapWrapper}>
				<MapView id="RideAnalysisMap">
					<MapOverlayScheduledPath
						id="2"
						lineData={rideAnalysisContext.geojson.scheduled_shape}
						pointsData={rideAnalysisContext.geojson.scheduled_path}
						visible={showScheduledPath}
					/>
					<MapOverlayObservedPath
						id="1"
						lineData={observedLineData}
						pointsData={observedPointsData}
						visible={showObservedPath}
					/>
					<MapOverlayGeofences
						geofencesData={rideAnalysisContext.geojson.scheduled_path_geofences}
						id="geofences"
						visible={showGeofences}
					/>
				</MapView>
			</div>
			<Divider />
			<Section alignItems="center" flexDirection="row" gap="md">
				<Switch checked={showScheduledPath} label={t('default:rides.analysis.RideAnalysisMap.switches.scheduled_path.label')} onChange={() => setShowScheduledPath(prev => !prev)} />
				<Switch checked={showObservedPath} label={t('default:rides.analysis.RideAnalysisMap.switches.observed_path.label')} onChange={() => setShowObservedPath(prev => !prev)} />
				<Switch checked={showGeofences} label={t('default:rides.analysis.RideAnalysisMap.switches.geofences.label')} onChange={() => setShowGeofences(prev => !prev)} />
			</Section>
			<Divider />
			{showReplay && (
				<ReplayEvents onReplayIndexChange={setReplayIndex} replayIndex={replayIndex} />
			)}
		</Collapsible>
	);

	//
}

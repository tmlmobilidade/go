'use client';

/* * */

import { ReplayEvents } from '@/components/common/ReplayEvents';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Collapsible, Divider, MapOverlayGeofences, MapOverlayObservedPath, MapOverlayScheduledPath, MapView, Section, Switch } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RideAnalysisMap() {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	const [showScheduledPath, setShowScheduledPath] = useState(true);
	const [showObservedPath, setShowObservedPath] = useState(true);
	const [showGeofences, setShowGeofences] = useState(false);

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisMap.description')} title={t('default:rides.analysis.RideAnalysisMap.title')} defaultOpen>
			<ReplayEvents />
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
						lineData={rideAnalysisContext.geojson.observed_shape}
						pointsData={rideAnalysisContext.geojson.observed_events}
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
		</Collapsible>
	);

	//
}

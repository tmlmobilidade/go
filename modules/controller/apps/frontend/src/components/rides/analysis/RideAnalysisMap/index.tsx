'use client';

/* * */

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

	const { t } = useTranslation('controller', { keyPrefix: 'analysis.map' });

	//
	// B. Render components

	return (
		<Collapsible description={t('description')} title={t('title')} defaultOpen>
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
				<Switch checked={showScheduledPath} label={t('scheduledPath')} onChange={() => setShowScheduledPath(prev => !prev)} />
				<Switch checked={showObservedPath} label={t('observedPath')} onChange={() => setShowObservedPath(prev => !prev)} />
				<Switch checked={showGeofences} label={t('geofences')} onChange={() => setShowGeofences(prev => !prev)} />
			</Section>
			{/* <Divider /> */}
			{/* <Section alignItems="center" flexDirection="row" gap="md">
				<Button icon={<IconPlayerPlayFilled />} label="Play" />
				<Slider />
				<Label size="sm" caps singleLine>Ordenar eventos por</Label>
				<SegmentedControl
					value="created_at"
					data={[
						{ label: 'Receção', value: 'received_at' },
						{ label: 'Operador', value: 'updated_at' },
						{ label: 'Veículo', value: 'created_at' },
					]}
				/>
			</Section> */}
		</Collapsible>
	);

	//
}

'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts, MapViewStyleAlertsLayerId } from '@/components/map/MapViewStyleAlerts';
import { Popup } from '@vis.gl/react-maplibre';
import { type MapLayerMouseEvent } from 'maplibre-gl';
import { useCallback, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface SelectedAlertPopup {
	description: string
	latitude: number
	longitude: number
	title: string
}

/* * */

export function AlertsListViewMap() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	const [selectedAlert, setSelectedAlert] = useState<null | SelectedAlertPopup>(null);

	//
	// B. Handle actions

	const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
		const alertFeature = event.features?.find(
			feature => feature.layer?.id === MapViewStyleAlertsLayerId,
		);

		if (alertFeature?.geometry?.type !== 'Point') {
			setSelectedAlert(null);
			return;
		}

		const [longitude, latitude] = alertFeature.geometry.coordinates;
		const title = typeof alertFeature.properties?.title === 'string' ? alertFeature.properties.title : '';
		const description = typeof alertFeature.properties?.description === 'string' ? alertFeature.properties.description : '';

		setSelectedAlert({
			description,
			latitude,
			longitude,
			title,
		});
	}, []);

	//
	// C. Render components

	return (
		<MapView
			id="alerts-list"
			interactiveLayerIds={[MapViewStyleAlertsLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleAlerts data={alertsListContext.data.fc} />
			{selectedAlert && (
				<Popup
					anchor="bottom"
					latitude={selectedAlert.latitude}
					longitude={selectedAlert.longitude}
					maxWidth="320px"
					offset={12}
					onClose={() => setSelectedAlert(null)}
					closeButton
				>
					<div className={styles.popup}>
						{selectedAlert.title && (
							<span className={styles.title}>{selectedAlert.title}</span>
						)}
						{selectedAlert.description && (
							<p className={styles.description}>{selectedAlert.description}</p>
						)}
					</div>
				</Popup>
			)}
		</MapView>
	);
}

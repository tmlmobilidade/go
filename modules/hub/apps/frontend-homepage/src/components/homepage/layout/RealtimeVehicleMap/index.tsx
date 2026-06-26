'use client';

/* * */

import { homepageContent } from '@/content/homepage';
import { useVehiclePositionContext } from '@/contexts/VehiclePosition.context';
import { Loader, MapOverlayVehicles, MapView } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface RealtimeVehicleMapProps {
	variant?: 'background' | 'default'
}

/* * */

export function RealtimeVehicleMap({ variant = 'default' }: RealtimeVehicleMapProps) {
	const isBackground = variant === 'background';

	//
	// A. Fetch data

	const { data: { vehiclePositionGeoJson }, flags: { error, loading } } = useVehiclePositionContext();

	//
	// C. Setup variables

	const hasVehicles = !!vehiclePositionGeoJson && vehiclePositionGeoJson.features.length > 0;
	const showLoader = loading && !hasVehicles;
	const showFallback = !isBackground && !loading && (!hasVehicles || !!error);

	//
	// E. Render components

	return (
		<div className={isBackground ? styles.background : styles.container}>
			<div className={styles.mapFrame}>
				<MapView
					id="vehicles-map"
					interactive={true}
					scrollZoom={false}
					scrollZoomModifierKey={isBackground ? 'meta' : undefined}
					showAttribution={!isBackground}
					showCompass={false}
					showSearchPin={false}
					toolbar={false}
					initialViewState={{
						bearing: 0,
						latitude: 38.748,
						longitude: -9.2,
						pitch: 0,
						zoom: 9.35,
					}}
					layers={{
						fullscreen: false,
						geolocate: false,
						navigation: isBackground,
						scale: false,
					}}
				>
					<MapOverlayVehicles display={isBackground ? 'ambient' : 'default'} vehiclesData={vehiclePositionGeoJson} />
				</MapView>
				<div className={isBackground ? styles.dimOverlay : styles.scanline} />
				{showLoader && (
					<div className={styles.loader}>
						<Loader size="md" />
					</div>
				)}
				{showFallback && (
					<div className={styles.fallback}>
						<strong>{homepageContent.map.fallbackTitle}</strong>
						<span>{homepageContent.map.fallbackBody}</span>
					</div>
				)}
			</div>
			{isBackground ? (
				<div className={styles.mapChromeStatus}>
					<span className={styles.liveDot} />
					<strong>{hasVehicles ? vehiclePositionGeoJson.features.length : '---'}</strong>
					<span>{homepageContent.map.statusLabel}</span>
				</div>
			) : (
				<div className={styles.statusBar}>
					<span className={styles.liveDot} />
					<strong>{hasVehicles ? vehiclePositionGeoJson.features.length : '---'}</strong>
					<span>{homepageContent.map.statusLabel}</span>
				</div>
			)}
		</div>
	);
}

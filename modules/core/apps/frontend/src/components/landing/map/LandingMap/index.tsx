'use client';

import { MapContextProvider, MapView, useMapViewContext } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import styles from './styles.module.css';

/* * */

const LISBON_VIEW = {
	latitude: 38.734,
	longitude: -9.145,
	zoom: 12.4,
};

/* * */

export function LandingMap() {
	return (
		<div className={styles.container}>
			<MapContextProvider preferenceScope="landing-map">
				<MapView id="landing-map" layers={{}} showSearchPin={false} toolbar={false}>
					<LandingMapViewport />
				</MapView>
			</MapContextProvider>
		</div>
	);
}

/* * */

function LandingMapViewport() {
	//

	// A. Setup variables

	const mapViewContext = useMapViewContext();

	//
	// B. Handle actions

	useEffect(() => {
		if (mapViewContext.flags.loading || !mapViewContext.ref.map.current) return;

		mapViewContext.actions.toggleAutoZoom(false);
		mapViewContext.ref.map.current.jumpTo(LISBON_VIEW);
	}, [mapViewContext]);

	return null;
}

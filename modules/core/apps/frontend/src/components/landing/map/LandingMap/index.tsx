'use client';

import { MapContextProvider, MapView, useMapViewContext } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

const LISBON_VIEW = {
	latitude: 38.734,
	longitude: -9.145,
	zoom: 12.4,
};

/* * */

export function LandingMap() {
	return (
		<MapContextProvider preferenceScope="landing-map">
			<MapView id="landing-map" layers={{}} showSearchPin={false} toolbar={false}>
				<LandingMapViewport />
			</MapView>
		</MapContextProvider>
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

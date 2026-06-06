'use client';

import { useBaseMap } from '@/components/common/base-map/use-base-map';
import { useUserLocation } from '@/components/map/use-user-location';
import { IconAlertTriangle, IconAlertTriangleOff, IconBus, IconBusOff, IconFlag2, IconFlag2Off } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function BaseMapOverlaysControl() {
	//

	//
	// A. Setup variables

	const { activeBaseMapOverlays, toggleBaseMapOverlay } = useBaseMap();
	const { userLocation } = useUserLocation();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('stops')}
				onClick={() => toggleBaseMapOverlay('stops')}
			>
				{activeBaseMapOverlays.includes('stops')
					? <IconFlag2 size={24} />
					: <IconFlag2Off size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('alerts')}
				onClick={() => toggleBaseMapOverlay('alerts')}
			>
				{activeBaseMapOverlays.includes('alerts')
					? <IconAlertTriangle size={24} />
					: <IconAlertTriangleOff size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('vehicles')}
				onClick={() => toggleBaseMapOverlay('vehicles')}
			>
				{activeBaseMapOverlays.includes('vehicles')
					? <IconBus size={24} />
					: <IconBusOff size={24} />}
			</div>

			<div className={styles.button}>
				h{userLocation?.coords?.heading}
			</div>

			<div className={styles.button}>
				a{userLocation?.coords?.accuracy}
			</div>

		</div>
	);
}

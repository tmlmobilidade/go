'use client';

import { useViewportMapOverlays } from '@/hooks/use-viewport-map-overlays';
import { IconAlertTriangle, IconAlertTriangleOff, IconBus, IconBusOff, IconFlag2, IconFlag2Off } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function ViewportMapOverlaysControl() {
	//

	//
	// A. Setup variables

	const { activeViewportMapOverlays, toggleViewportMapOverlay } = useViewportMapOverlays();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div
				className={styles.button}
				data-enabled={activeViewportMapOverlays.includes('stops')}
				onClick={() => toggleViewportMapOverlay('stops')}
			>
				{activeViewportMapOverlays.includes('stops')
					? <IconFlag2 size={24} />
					: <IconFlag2Off size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeViewportMapOverlays.includes('alerts')}
				onClick={() => toggleViewportMapOverlay('alerts')}
			>
				{activeViewportMapOverlays.includes('alerts')
					? <IconAlertTriangle size={24} />
					: <IconAlertTriangleOff size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeViewportMapOverlays.includes('vehicles')}
				onClick={() => toggleViewportMapOverlay('vehicles')}
			>
				{activeViewportMapOverlays.includes('vehicles')
					? <IconBus size={24} />
					: <IconBusOff size={24} />}
			</div>

		</div>
	);
}

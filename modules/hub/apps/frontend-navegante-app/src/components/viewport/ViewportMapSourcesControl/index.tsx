'use client';

import { useViewportMapSources } from '@/hooks/use-viewport-map-sources';
import { IconAlertTriangle, IconAlertTriangleOff, IconBus, IconBusOff, IconFlag2, IconFlag2Off } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function ViewportMapSourcesControl() {
	//

	//
	// A. Setup variables

	const { activeViewportMapSources, toggleViewportMapSource } = useViewportMapSources();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div
				className={styles.button}
				data-enabled={activeViewportMapSources.includes('stops')}
				onClick={() => toggleViewportMapSource('stops')}
			>
				{activeViewportMapSources.includes('stops')
					? <IconFlag2 size={24} />
					: <IconFlag2Off size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeViewportMapSources.includes('alerts')}
				onClick={() => toggleViewportMapSource('alerts')}
			>
				{activeViewportMapSources.includes('alerts')
					? <IconAlertTriangle size={24} />
					: <IconAlertTriangleOff size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeViewportMapSources.includes('vehicles')}
				onClick={() => toggleViewportMapSource('vehicles')}
			>
				{activeViewportMapSources.includes('vehicles')
					? <IconBus size={24} />
					: <IconBusOff size={24} />}
			</div>

		</div>
	);
}

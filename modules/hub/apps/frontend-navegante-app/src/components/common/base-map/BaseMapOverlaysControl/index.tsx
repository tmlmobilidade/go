'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useMapContext } from '@/components/map/Map.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { IconAlertTriangle, IconAlertTriangleOff, IconBus, IconBusOff, IconFlag2, IconFlag2Off } from '@tabler/icons-react';
import { Loader } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function BaseMapOverlaysControl() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();
	const alertsContext = useAlertsContext();

	const { actions: { toggleBaseMapOverlay }, data: { activeBaseMapOverlays } } = useMapContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('stops')}
				onClick={() => toggleBaseMapOverlay('stops')}
			>
				{stopsContext.flags.isLoading ?
					<Loader size="sm" /> :
					activeBaseMapOverlays.includes('stops')
						? <IconFlag2 size={24} />
						: <IconFlag2Off size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('alerts')}
				onClick={() => toggleBaseMapOverlay('alerts')}
			>
				{alertsContext.flags.isLoading ?
					<Loader size="sm" /> :
					activeBaseMapOverlays.includes('alerts')
						? <IconAlertTriangle size={24} />
						: <IconAlertTriangleOff size={24} />}
			</div>

			<div
				className={styles.button}
				data-enabled={activeBaseMapOverlays.includes('vehicles')}
				onClick={() => toggleBaseMapOverlay('vehicles')}
			>
				{vehiclesContext.flags.isLoading ?
					<Loader size="sm" /> :
					activeBaseMapOverlays.includes('vehicles')
						? <IconBus size={24} />
						: <IconBusOff size={24} />}
			</div>

		</div>
	);
}

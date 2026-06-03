'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { IconBus, IconBusOff } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function StopsListViewMapVehiclesToggle() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<div
			className={styles.button}
			data-enabled={stopsListContext.view.showVehicles}
			onClick={stopsListContext.view.toggleShowVehicles}
		>
			{stopsListContext.view.showVehicles ? <IconBus size={20} /> : <IconBusOff size={20} />}
		</div>
	);
}

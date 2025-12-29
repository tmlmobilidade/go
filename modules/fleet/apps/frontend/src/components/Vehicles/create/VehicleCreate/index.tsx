'use client';

/* * */

import { VehicleCreateModalHeader } from '@/components/Vehicles/create/VehicleCreateModalHeader';
import { Divider, Pane } from '@tmlmobilidade/ui';

import { VehicleCreateModalAlerts } from '../VehicleCreateModalAlerts';
import { VehicleCreateModalControls } from '../VehicleCreateModalControls';
import { VehicleCreateModalSwitch } from '../VehicleCreateModalSwitch';

/* * */

export function VehicleCreate() {
	return (
		<Pane header={[<VehicleCreateModalHeader />]}>
			<VehicleCreateModalAlerts />
			<VehicleCreateModalSwitch />
			<Divider />
			<VehicleCreateModalControls />
		</Pane>
	);
}

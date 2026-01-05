'use client';

/* * */

import { VehicleImportModalHeader } from '@/components/Vehicles/import/VehicleImportModalHeader';
import { Divider, Pane } from '@tmlmobilidade/ui';

import { VehicleImportModalAlerts } from '../VehicleImportAlerts';
import { VehicleImportModalControls } from '../VehicleImportControls';
import { VehicleImportModalSwitch } from '../VehicleImportSwitch';
// import { VehicleImportTable } from '../VehicleImportTable';

/* * */

export function VehicleImport() {
	return (
		<Pane header={[<VehicleImportModalHeader />]}>
			<VehicleImportModalAlerts />
			<VehicleImportModalSwitch />
			<Divider />
			<VehicleImportModalControls />
		</Pane>
	);
}

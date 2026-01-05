'use client';

/* * */

import { VehicleImportModalHeader } from '@/components/Vehicles/import/VehicleImportModalHeader';
import { Pane } from '@tmlmobilidade/ui';

import { VehicleImportFile } from '../VehicleImportFile';
// import { VehicleImportTable } from '../VehicleImportTable';

/* * */

export function VehicleImport() {
	return (
		<Pane header={[<VehicleImportModalHeader />]}>
			<VehicleImportFile />
		</Pane>
	);
}

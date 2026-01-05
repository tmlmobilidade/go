'use client';

/* * */

import { VehicleImportHeader } from '@/components/Vehicles/import/VehicleImportHeader';
import { Pane } from '@tmlmobilidade/ui';

import { VehicleImportFile } from '../VehicleImportFile';
// import { VehicleImportTable } from '../VehicleImportTable';

/* * */

export function VehicleImport() {
	return (
		<Pane header={[<VehicleImportHeader />]}>
			<VehicleImportFile />
		</Pane>
	);
}

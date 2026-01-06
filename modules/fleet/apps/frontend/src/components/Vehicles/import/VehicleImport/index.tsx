'use client';

/* * */

import { VehicleImportFile } from '@/components/Vehicles/import/VehicleImportFile';
import { VehicleImportHeader } from '@/components/Vehicles/import/VehicleImportHeader';
import { Pane } from '@tmlmobilidade/ui';
// import { VehicleImportTable } from '../VehicleImportTable';

/* * */

export function VehicleImport() {
	return (
		<Pane header={[<VehicleImportHeader />]}>
			<VehicleImportFile />
		</Pane>
	);
}

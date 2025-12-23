'use client';

/* * */

import { VehicleCreateBasicInfo } from '@/components/Vehicles/create/VehicleCreateBasicInfo';
import { VehicleCreateHeader } from '@/components/Vehicles/create/VehicleCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function VehicleCreate() {
	return (
		<Pane header={[<VehicleCreateHeader />]}>
			<VehicleCreateBasicInfo />
		</Pane>
	);
}

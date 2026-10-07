'use client';

import { Pane } from '@tmlmobilidade/ui';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';
import { VehiclesDetailFunctionalities } from '../VehiclesDetailFunctionalities';
import { VehiclesDetailHeader } from '../VehiclesDetailHeader';
import { VehiclesDetailIdentification } from '../VehiclesDetailIdentification';
import { VehiclesDetailMap } from '../VehiclesDetailMap';
import { VehiclesDetailSpecifications } from '../VehiclesDetailSpecifications';

/* * */

export function VehiclesDetail() {
	//

	//
	// A. Setup variables

	const { status } = useVehiclesDetailFormContext();

	//
	// B. Render components

	return (
		<Pane header={[<VehiclesDetailHeader key="header" />]} isLoading={status.isLoading}>
			<VehiclesDetailMap />
			<VehiclesDetailIdentification />
			<VehiclesDetailSpecifications />
			<VehiclesDetailFunctionalities />
		</Pane>
	);
}

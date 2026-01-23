'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { VehiclesDetailsHeader } from '../VehiclesDetailsHeader';
import { VehicleDetailsInfos } from '../VehiclesDetailsInfos';

/* * */

export function VehiclesDetails() {
	return (
		<Pane header={[<VehiclesDetailsHeader />]}>
			<VehicleDetailsInfos />
		</Pane>
	);
}

'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { VehicleDetailsHeader } from '../VehicleDetailsHeader';
import { VehicleDetailsSectionFunctionalities } from '../VehicleDetailsSectionFunctionalities';
import { VehicleDetailsSectionIdentification } from '../VehicleDetailsSectionIdentification';
import { VehicleDetailsSectionSpecifications } from '../VehicleDetailsSectionSpecifications';

/* * */

export function VehicleDetails() {
	return (
		<Pane header={[<VehicleDetailsHeader key="header" />]}>
			<VehicleDetailsSectionIdentification />
			<VehicleDetailsSectionSpecifications />
			<VehicleDetailsSectionFunctionalities />
		</Pane>
	);
}

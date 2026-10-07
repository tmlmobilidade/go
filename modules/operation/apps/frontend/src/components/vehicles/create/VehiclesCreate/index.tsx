'use client';

import { Pane } from '@tmlmobilidade/ui';

import { VehiclesCreateHeader } from '../VehiclesCreateHeader';
import { VehiclesCreateInfos } from '../VehiclesCreateInfos';

/* * */

export function VehiclesCreate() {
	return (
		<Pane header={[<VehiclesCreateHeader key="header" />]}>
			<VehiclesCreateInfos />
		</Pane>
	);
}

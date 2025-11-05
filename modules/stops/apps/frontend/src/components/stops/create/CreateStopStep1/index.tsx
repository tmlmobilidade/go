'use client';

/* * */

import { CreateStopStep1Coordinates } from '@/components/stops/create/CreateStopStep1Coordinates';
import { CreateStopStep1Locations } from '@/components/stops/create/CreateStopStep1Locations';
import { CreateStopStep1Map } from '@/components/stops/create/CreateStopStep1Map';
import { Divider } from '@go/ui';

/* * */

export function CreateStopStep1() {
	return (
		<>
			<CreateStopStep1Map />
			<Divider />
			<CreateStopStep1Coordinates />
			<Divider />
			<CreateStopStep1Locations />
		</>
	);
}

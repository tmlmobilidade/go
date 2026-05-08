'use client';

import { StopCreateStep1Coordinates } from '@/components/stops/create/StopCreateStep1Coordinates';
import { StopCreateStep1Locations } from '@/components/stops/create/StopCreateStep1Locations';
import { StopCreateStep1Map } from '@/components/stops/create/StopCreateStep1Map';
import { Divider } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep1() {
	return (
		<>
			<StopCreateStep1Map />
			<Divider />
			<StopCreateStep1Coordinates />
			<Divider />
			<StopCreateStep1Locations />
		</>
	);
}

'use client';

/* * */

import { CreateStopStep2Inputs } from '@/components/stops/create/CreateStopStep2Inputs';
import { CreateStopStep2Instructions } from '@/components/stops/create/CreateStopStep2Instructions';
import { Divider } from '@go/ui';

/* * */

export function CreateStopStep2() {
	return (
		<>
			<CreateStopStep2Instructions />
			<Divider />
			<CreateStopStep2Inputs />
		</>
	);
}

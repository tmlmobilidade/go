'use client';

/* * */

import { CreateStopStep1Locations } from '@/components/stops/create/CreateStopStep1Locations';
import { CreateStopStep3Summary } from '@/components/stops/create/CreateStopStep3Summary';
import { Divider } from '@tmlmobilidade/ui';

/* * */

export function CreateStopStep3() {
	return (
		<>
			<CreateStopStep3Summary />
			<Divider />
			<CreateStopStep1Locations />
		</>
	);
}

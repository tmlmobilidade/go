'use client';

import { StopCreateStep1Locations } from '@/components/stops/create/StopCreateStep1Locations';
import { StopCreateStep3Summary } from '@/components/stops/create/StopCreateStep3Summary';
import { Divider } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep3() {
	return (
		<>
			<StopCreateStep3Summary />
			<Divider />
			<StopCreateStep1Locations />
		</>
	);
}

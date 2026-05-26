'use client';

import { StopCreateStep2Inputs } from '@/components/stops/create/StopCreateStep2Inputs';
import { StopCreateStep2Instructions } from '@/components/stops/create/StopCreateStep2Instructions';
import { Divider } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep2() {
	return (
		<>
			<StopCreateStep2Instructions />
			<Divider />
			<StopCreateStep2Inputs />
		</>
	);
}

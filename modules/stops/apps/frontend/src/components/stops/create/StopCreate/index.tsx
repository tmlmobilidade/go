'use client';

import { StopCreateModalAlerts } from '@/components/stops/create/StopCreateModalAlerts';
import { StopCreateModalControls } from '@/components/stops/create/StopCreateModalControls';
import { StopCreateModalHeader } from '@/components/stops/create/StopCreateModalHeader';
import { StopCreateModalSwitch } from '@/components/stops/create/StopCreateModalSwitch';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function StopCreate() {
	return (
		<Pane header={[<StopCreateModalHeader />]}>
			<StopCreateModalAlerts />
			<StopCreateModalSwitch />
			<Divider />
			<StopCreateModalControls />
		</Pane>
	);
}

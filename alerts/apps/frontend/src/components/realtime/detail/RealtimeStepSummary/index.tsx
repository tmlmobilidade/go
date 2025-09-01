/* * */

import { Separator } from '@tmlmobilidade/ui';

import { AffectedRides } from './AffectedRides';
import { AlertBasicInfo } from './AlertBasicInfo';
import { CauseAndEffect } from './CauseAndEffect';

/* * */

export function RealtimeStepSummary() {
	return (
		<div style={{ overflowX: 'hidden', width: '100%' }}>

			<AlertBasicInfo />
			<Separator />
			<CauseAndEffect />
			<Separator />
			<AffectedRides />
		</div>
	);
}

/* * */

import { AffectedRides } from './AffectedRides';
import { AlertBasicInfo } from './AlertBasicInfo';
import { CauseAndEffect } from './CauseAndEffect';

/* * */

export function RealtimeStepSummary() {
	return (
		<div style={{ overflowX: 'hidden', width: '100%' }}>
			<AlertBasicInfo />
			<CauseAndEffect />
			<AffectedRides />
		</div>
	);
}

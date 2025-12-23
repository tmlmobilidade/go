/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { getAlertTitleAndDescription } from '@/lib/translations';
import { Divider } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import { AffectedRides } from './AffectedRides';
import { AlertBasicInfo } from './AlertBasicInfo';
import { CauseAndEffect } from './CauseAndEffect';

/* * */

export function RealtimeCreateStepSummary() {
	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Transform data

	useEffect(() => {
		const uniqueLineIds = Array.from(new Set(realtimeCreateContext.data.form.getValues().references?.map(ride => ride.parent_id)));
		const { description, title } = getAlertTitleAndDescription(realtimeCreateContext.data.form.values.cause, realtimeCreateContext.data.form.values.effect, uniqueLineIds.join(', '));
		realtimeCreateContext.data.form.setFieldValue('title', title);
		realtimeCreateContext.data.form.setFieldValue('description', description);
	}, []);

	return (
		<div style={{ overflowX: 'hidden', width: '100%' }}>
			<AlertBasicInfo />
			<Divider />
			<CauseAndEffect />
			<Divider />
			<AffectedRides />
		</div>
	);
}

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { getAlertTitleAndDescription } from '@/lib/translations';
import { Separator } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import { AffectedRides } from './AffectedRides';
import { AlertBasicInfo } from './AlertBasicInfo';
import { CauseAndEffect } from './CauseAndEffect';

/* * */

export function RealtimeCreateStepSummary() {
	//
	// A. Setup variables

	const { data: { form, selectedRides } } = useRealtimeCreateContext();

	//
	// B. Transform data

	useEffect(() => {
		const uniqueLineIds = Array.from(new Set(selectedRides.map(ride => ride.line_id)));
		const { description, title } = getAlertTitleAndDescription(form.values.cause, form.values.effect, uniqueLineIds.join(', '));
		form.setFieldValue('title', title);
		form.setFieldValue('description', description);
	}, []);

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

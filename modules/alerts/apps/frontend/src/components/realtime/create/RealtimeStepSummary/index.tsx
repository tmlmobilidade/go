/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { getAlertTitleAndDescription } from '@/lib/translations';
import { Separator } from '@tmlmobilidade/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AffectedRides } from './AffectedRides';
import { AlertBasicInfo } from './AlertBasicInfo';
import { CauseAndEffect } from './CauseAndEffect';

/* * */

export function RealtimeStepSummary() {
	//
	// A. Setup variables

	const { data: { form, selectedRides } } = useRealtimeCreateContext();
	const { t } = useTranslation('global');

	//
	// B. Transform data

	useEffect(() => {
		const uniqueLineIds = Array.from(new Set(selectedRides.map(ride => ride.line_id)));
		const { descriptionKey, params, titleKey } = getAlertTitleAndDescription(form.values.cause, form.values.effect, uniqueLineIds.join(', '));
		const description = t(descriptionKey, params);
		const title = t(titleKey, params);
		form.setFieldValue('title', title);
		form.setFieldValue('description', description);
	}, [form.values.cause, form.values.effect, selectedRides, t]);

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

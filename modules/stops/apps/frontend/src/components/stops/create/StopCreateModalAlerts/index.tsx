'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { AlertMessage } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateModalAlerts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('stops');
	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	if (!stopCreateContext.flags.error) {
		return null;
	}

	return (
		<AlertMessage
			title={stopCreateContext.flags.error?.message ?? t('stops.create.Alerts.unknown_error')}
			variant="danger"
		/>
	);

	//
}

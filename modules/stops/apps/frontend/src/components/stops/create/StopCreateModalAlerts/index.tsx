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

	const stopCreateContext = useStopCreateContext();
	const { t } = useTranslation('stops', { keyPrefix: 'create.alerts' });

	//
	// B. Render components

	if (!stopCreateContext.flags.error) {
		return null;
	}

	return (
		<AlertMessage
			title={stopCreateContext.flags.error?.message ?? t('unknownError')}
			variant="danger"
		/>
	);

	//
}

'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { AlertMessage } from '@tmlmobilidade/ui';

/* * */

export function StopCreateModalAlerts() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	if (!stopCreateContext.flags.error) {
		return null;
	}

	return (
		<AlertMessage
			title={stopCreateContext.flags.error?.message ?? 'Erro desconhecido.'}
			variant="danger"
		/>
	);

	//
}

'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { AlertMessage } from '@go/ui';

/* * */

export function CreateStopModalAlerts() {
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

'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Tag, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailSystemStatus() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	if (!meContext.actions.hasPermission('rides', 'update')) {
		return null;
	}

	if (ridesDetailContext.data.ride?.system_status === 'waiting') {
		return <Tag label="Em espera" variant="primary" />;
	}

	if (ridesDetailContext.data.ride?.system_status === 'processing') {
		return <Tag label="Em Processamento" onClick={ridesDetailContext.actions.reprocessRide} variant="primary" filled />;
	}

	if (ridesDetailContext.data.ride?.system_status === 'error') {
		return <Tag label="Erro" onClick={ridesDetailContext.actions.reprocessRide} variant="danger" filled />;
	}

	return <Tag label="Concluído" onClick={ridesDetailContext.actions.reprocessRide} variant="success" />;

	//
}

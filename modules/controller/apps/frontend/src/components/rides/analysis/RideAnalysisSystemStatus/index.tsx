'use client';

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Tag, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RideAnalysisSystemStatus() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const RideAnalysisContext = useRideAnalysisContext();

	//
	// B. Render components

	if (!meContext.actions.hasPermission('rides', 'update')) {
		return null;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'waiting') {
		return <Tag label="Em espera" variant="primary" />;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'processing') {
		return <Tag label="Em Processamento" onClick={RideAnalysisContext.actions.reprocessRide} variant="primary" filled />;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'error') {
		return <Tag label="Erro" onClick={RideAnalysisContext.actions.reprocessRide} variant="danger" filled />;
	}

	return <Tag label="Concluído" onClick={RideAnalysisContext.actions.reprocessRide} variant="success" />;

	//
}

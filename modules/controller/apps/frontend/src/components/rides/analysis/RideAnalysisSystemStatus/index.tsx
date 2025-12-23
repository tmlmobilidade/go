'use client';

/* * */

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Tag, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisSystemStatus() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Render components

	if (!meContext.actions.hasPermission('rides', 'update')) {
		return null;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'waiting') {
		return <Tag label={t('waiting')} variant="primary" />;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'processing') {
		return <Tag label={t('processing')} onClick={RideAnalysisContext.actions.reprocessRide} variant="primary" filled />;
	}

	if (RideAnalysisContext.data.ride?.system_status === 'error') {
		return <Tag label={t('error')} onClick={RideAnalysisContext.actions.reprocessRide} variant="danger" filled />;
	}

	return <Tag label={t('concluded')} onClick={RideAnalysisContext.actions.reprocessRide} variant="success" />;

	//
}

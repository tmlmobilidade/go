/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ProcessingStatus, type UnixTimestamp } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { use, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface PlanStatusTagProps {
	status: ProcessingStatus
	timestamp?: UnixTimestamp
}

/* * */

export function PlanStatusTag({ status, timestamp }: PlanStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Transform data

	const parsedTimestamp = useMemo(() => {
		if (!timestamp) return;
		return Dates
			.fromUnixTimestamp(timestamp)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm');
	}, [timestamp]);

	//
	// C. Render components

	if (status === 'waiting') {
		return <Tag label={t('waiting')} tooltip={parsedTimestamp} variant="primary" />;
	}

	if (status === 'processing') {
		return <Tag label={t('processing')} tooltip={parsedTimestamp} variant="primary" filled />;
	}

	if (status === 'complete') {
		return <Tag label={t('complete')} tooltip={parsedTimestamp} variant="success" />;
	}

	if (status === 'error') {
		return <Tag label={t('error')} tooltip={parsedTimestamp} variant="danger" filled />;
	}

	if (status === 'skipped') {
		return <Tag label={t('skipped')} tooltip={parsedTimestamp} variant="muted" />;
	}

	return <Tag label={t('unknown')} tooltip={parsedTimestamp} variant="muted" />;

	//
}

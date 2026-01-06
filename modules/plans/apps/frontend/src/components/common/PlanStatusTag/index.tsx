/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ProcessingStatus, type UnixTimestamp } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
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

	const { t } = useTranslation('plans');

	//
	// B. Transform data

	const parsedTimestamp = useMemo(() => {
		if (!timestamp) return;
		return Dates
			.fromUnixTimestamp(timestamp)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat(`'${t('common.PlanStatusTag.updated_at')}' yyyy-LL-dd 'às' HH:mm`);
	}, [timestamp, t]);

	//
	// C. Render components

	if (status === 'waiting') {
		return <Tag label={t('common.PlanStatusTag.waiting')} tooltip={parsedTimestamp} variant="primary" />;
	}

	if (status === 'processing') {
		return <Tag label={t('common.PlanStatusTag.processing')} tooltip={parsedTimestamp} variant="primary" filled />;
	}

	if (status === 'complete') {
		return <Tag label={t('common.PlanStatusTag.complete')} tooltip={parsedTimestamp} variant="success" />;
	}

	if (status === 'error') {
		return <Tag label={t('common.PlanStatusTag.error')} tooltip={parsedTimestamp} variant="danger" filled />;
	}

	if (status === 'skipped') {
		return <Tag label={t('common.PlanStatusTag.skipped')} tooltip={parsedTimestamp} variant="muted" />;
	}

	return <Tag label={t('common.PlanStatusTag.unknown')} tooltip={parsedTimestamp} variant="muted" />;

	//
}

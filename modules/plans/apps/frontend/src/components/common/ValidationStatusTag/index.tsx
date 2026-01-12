/* * */

import { type ProcessingStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface ValidationStatusTagProps {
	status: ProcessingStatus
}

/* * */

export function ValidationStatusTag({ status }: ValidationStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (status === 'waiting') {
		return <Tag label={t('plans:common.ValidationStatusTag.waiting')} variant="secondary" />;
	}

	if (status === 'processing') {
		return <Tag label={t('plans:common.ValidationStatusTag.processing')} variant="primary" filled />;
	}

	if (status === 'complete') {
		return <Tag label={t('plans:common.ValidationStatusTag.complete')} variant="success" filled />;
	}

	if (status === 'error') {
		return <Tag label={t('plans:common.ValidationStatusTag.error')} variant="danger" filled />;
	}

	return <Tag label={t('plans:common.ValidationStatusTag.default')} variant="muted" />;

	//
}

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
	// A. Setup Variables

	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Render components

	if (status === 'waiting') {
		return <Tag label={t('waiting')} variant="secondary" />;
	}

	if (status === 'processing') {
		return <Tag label={t('processing')} variant="primary" />;
	}

	if (status === 'complete') {
		return <Tag label={t('complete')} variant="success" filled />;
	}

	if (status === 'error') {
		return <Tag label={t('error')} variant="danger" filled />;
	}

	return <Tag label={t('default')} variant="muted" />;

	//
}

/* * */

import { AlertSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertTagPublishStatusProps {
	value: typeof AlertSchema.shape.publish_status._type
}

/* * */

export function AlertTagPublishStatus({ value }: AlertTagPublishStatusProps) {
	//
	// A. Setup variables

	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	if (value === 'DRAFT') return <Tag label={t('draft')} variant="muted" />;
	if (value === 'ARCHIVED') return <Tag label={t('archived')} variant="primary" />;
	if (value === 'PUBLISHED') return <Tag label={t('published')} variant="primary" filled />;

	return <Tag label={t('unknown')} variant="danger" />;

	//
}

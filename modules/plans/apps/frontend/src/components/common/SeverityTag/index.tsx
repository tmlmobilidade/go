/* * */

import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface SeverityTagProps {
	label?: string
	severity: 'error' | 'forbidden' | 'ignore' | 'warning'
}

/* * */

export function SeverityTag({ label, severity }: SeverityTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('plans');

	//
	// B. Render components

	if (severity === 'error') {
		return <Tag label={label ?? t('common.SeverityTag.error')} variant="danger" filled />;
	}

	if (severity === 'forbidden') {
		return <Tag label={label ?? t('common.SeverityTag.forbidden')} variant="danger" filled />;
	}

	if (severity === 'warning') {
		return <Tag label={label ?? t('common.SeverityTag.warning')} variant="warning" filled />;
	}

	//
}

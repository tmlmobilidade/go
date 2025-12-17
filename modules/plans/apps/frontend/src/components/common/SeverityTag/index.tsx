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

	// s
	// A. Setup Variables

	const { t } = useTranslation('global', { keyPrefix: 'severitys' });

	//
	// B. Render components

	if (severity === 'error') {
		return <Tag label={label ?? t('error')} variant="danger" filled />;
	}

	if (severity === 'forbidden') {
		return <Tag label={label ?? t('forbidden')} variant="danger" filled />;
	}

	if (severity === 'warning') {
		return <Tag label={label ?? t('warning')} variant="warning" filled />;
	}

	//
}

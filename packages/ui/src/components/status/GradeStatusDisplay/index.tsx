'use client';

import { type GradeStatus } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import { Tag } from '../../tags/Tag';

/* * */

interface GradeStatusDisplayProps {
	tooltip?: string
	value?: GradeStatus | null
}

/* * */

export function GradeStatusDisplay({ tooltip, value }: GradeStatusDisplayProps) {
	//

	const { t } = useTranslation();

	if (!value) return;

	return (
		<>
			{value === 'pass' && <Tag label={t('shared:status.grade_status.pass')} tooltip={tooltip} variant="success" />}
			{value === 'fail' && <Tag label={t('shared:status.grade_status.fail')} tooltip={tooltip} variant="danger" />}
			{value === 'skip' && <Tag label={t('shared:status.grade_status.skip')} tooltip={tooltip} variant="muted" />}
			{value === 'error' && <Tag label={t('shared:status.grade_status.error')} tooltip={tooltip} variant="danger" filled />}
		</>
	);
}

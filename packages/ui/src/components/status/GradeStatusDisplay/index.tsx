'use client';

import { type GradeStatus } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import { Tag } from '../../tags/Tag';

/* * */

interface GradeStatusDisplayProps {
	value?: GradeStatus | null
}

/* * */

export function GradeStatusDisplay({ value }: GradeStatusDisplayProps) {
	//

	const { t } = useTranslation();

	if (!value) return;

	return (
		<>
			{value === 'pass' && <Tag label={t('shared:status.grade_status.pass')} variant="success" />}
			{value === 'fail' && <Tag label={t('shared:status.grade_status.fail')} variant="danger" />}
			{value === 'skip' && <Tag label={t('shared:status.grade_status.skip')} variant="muted" />}
			{value === 'error' && <Tag label={t('shared:status.grade_status.error')} variant="danger" filled />}
		</>
	);
}

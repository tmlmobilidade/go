'use client';

import { type GradeStatus } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import { Tag } from '../Tag';

/* * */

interface GradeStatusTagProps {
	value: GradeStatus
}

/* * */

export function GradeStatusTag({ value }: GradeStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

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

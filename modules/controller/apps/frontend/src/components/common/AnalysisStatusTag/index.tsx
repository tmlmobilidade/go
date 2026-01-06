'use client';

/* * */

import { IconCheck, IconX } from '@tabler/icons-react';
import { type RideAnalysis } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AnalysisStatusTagProps {
	grade: 'none' | RideAnalysis['grade']
}

/* * */

export function AnalysisStatusTag({ grade }: AnalysisStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('controller');

	//
	// B. Render components

	if (grade === 'none') {
		return null;
	}

	if (grade === 'pass') {
		return <Tag icon={<IconCheck />} label={t('rides.detail.AnalysisStatusTag.pass')} variant="success" />;
	}

	if (grade === 'fail') {
		return <Tag icon={<IconX stroke={4} />} label={t('rides.detail.AnalysisStatusTag.fail')} variant="danger" />;
	}

	//
}

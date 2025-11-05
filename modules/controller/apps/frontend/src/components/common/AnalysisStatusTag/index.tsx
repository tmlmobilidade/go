'use client';

/* * */

import { type RideAnalysis } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { IconCheck, IconX } from '@tabler/icons-react';

/* * */

interface AnalysisStatusTagProps {
	grade: 'none' | RideAnalysis['grade']
}

/* * */

export function AnalysisStatusTag({ grade }: AnalysisStatusTagProps) {
	//

	if (grade === 'none') {
		return null;
	}

	if (grade === 'pass') {
		return <Tag icon={<IconCheck />} label="Pass" variant="success" />;
	}

	if (grade === 'fail') {
		return <Tag icon={<IconX stroke={4} />} label="Fail" variant="danger" />;
	}

	//
}

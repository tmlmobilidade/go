'use client';

/* * */

import { IconCheck, IconX } from '@tabler/icons-react';
import { type RideAnalysis } from '@tmlmobilidade/go-types';
import { Tag } from '@tmlmobilidade/ui';

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

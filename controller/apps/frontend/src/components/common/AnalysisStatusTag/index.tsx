'use client';

/* * */

import { IconCheck, IconX } from '@tabler/icons-react';
import { RideAcceptance } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AnalysisStatusTagProps {
	analysis?: RideAcceptance['analysis_summary']
}

/* * */

export function AnalysisStatusTag({ analysis }: AnalysisStatusTagProps) {
	//

	if (!analysis) {
		return null;
	}

	for (const item of Object.values(analysis)) {
		if (item.grade === 'fail') {
			return <Tag icon={<IconX stroke={4} />} label="Fail" variant="danger" />;
		}
	}

	return <Tag icon={<IconCheck />} label="Pass" variant="success" />;

	//
}

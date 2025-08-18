'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AnalysisStatusTagProps {
	grade: RideNormalized['simple_three_vehicle_events_grade']
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

'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AnalysisStatusTagProps {
	grade?: RideNormalized['analysis']['SIMPLE_THREE_VEHICLE_EVENTS']['grade']
	operationalStatus?: RideNormalized['operational_status']
}

/* * */

export function AnalysisStatusTag({ grade, operationalStatus }: AnalysisStatusTagProps) {
	//

	if (operationalStatus === 'scheduled' || operationalStatus === 'running') {
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

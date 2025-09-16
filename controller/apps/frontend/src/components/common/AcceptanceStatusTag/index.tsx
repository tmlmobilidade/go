'use client';

/* * */

import { IconAlertCircle, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { RideAcceptanceStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface AcceptanceStatusTagProps {
	grade: 'none' | RideAcceptanceStatus
}

/* * */

export function AcceptanceStatusTag({ grade }: AcceptanceStatusTagProps) {
	//

	if (grade === 'none') {
		return null;
	}

	if (grade === 'accepted') {
		return <Tag icon={<IconCheck />} label="Aceite" variant="success" />;
	}

	if (grade === 'under_review') {
		return <Tag icon={<IconClock />} label="Em Revisão" variant="secondary" />;
	}

	if (grade === 'justification_required') {
		return <Tag icon={<IconAlertCircle />} label="Justificação Necessária" variant="warning" />;
	}

	if (grade === 'rejected') {
		return <Tag icon={<IconX stroke={4} />} label="Rejeitada" variant="danger" />;
	}

	//
}

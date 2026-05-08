'use client';

import { IconAlertCircle, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { RideAcceptanceStatus } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AcceptanceStatusTagProps {
	grade: 'none' | RideAcceptanceStatus
}

/* * */

export function AcceptanceStatusTag({ grade }: AcceptanceStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (grade === 'none') {
		return null;
	}

	if (grade === 'accepted') {
		return <Tag icon={<IconCheck />} label={t('default:rides.detail.RidesDetailAcceptanceStatusTag.accepted')} variant="success" />;
	}

	if (grade === 'under_review') {
		return <Tag icon={<IconClock />} label={t('default:rides.detail.RidesDetailAcceptanceStatusTag.under_review')} variant="secondary" />;
	}

	if (grade === 'justification_required') {
		return <Tag icon={<IconAlertCircle />} label={t('default:rides.detail.RidesDetailAcceptanceStatusTag.justification_required')} variant="warning" />;
	}

	if (grade === 'rejected') {
		return <Tag icon={<IconX />} label={t('default:rides.detail.RidesDetailAcceptanceStatusTag.rejected')} variant="danger" />;
	}

	//
}

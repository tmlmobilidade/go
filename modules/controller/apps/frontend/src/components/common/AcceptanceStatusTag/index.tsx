'use client';

/* * */

import { IconAlertCircle, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { RideAcceptanceStatus } from '@tmlmobilidade/types';
import { Tag, TagProps } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AcceptanceStatusTagProps {
	grade: 'none' | RideAcceptanceStatus
}

/* * */

const { t } = useTranslation();

export const AcceptanceStatusProps = Object.freeze({
	accepted: {
		icon: <IconCheck />,
		label: t('controller:rides.detail.AcceptanceStatusTag.accepted'),
		variant: 'success',
	},
	justification_required: {
		icon: <IconAlertCircle />,
		label: t('controller:rides.detail.AcceptanceStatusTag.justification_required'),
		variant: 'warning',
	},
	rejected: {
		icon: <IconX />,
		label: t('controller:rides.detail.AcceptanceStatusTag.rejected'),
		variant: 'danger',
	},
	under_review: {
		icon: <IconClock />,
		label: t('controller:rides.detail.AcceptanceStatusTag.under_review'),
		variant: 'secondary',
	},
});

export function AcceptanceStatusTag({ grade }: AcceptanceStatusTagProps) {
	//

	if (grade === 'none') {
		return null;
	}

	if (grade === 'accepted') {
		return <Tag icon={AcceptanceStatusProps.accepted.icon} label={AcceptanceStatusProps.accepted.label} variant={AcceptanceStatusProps.accepted.variant as TagProps['variant']} />;
	}

	if (grade === 'under_review') {
		return <Tag icon={AcceptanceStatusProps.under_review.icon} label={AcceptanceStatusProps.under_review.label} variant={AcceptanceStatusProps.under_review.variant as TagProps['variant']} />;
	}

	if (grade === 'justification_required') {
		return <Tag icon={AcceptanceStatusProps.justification_required.icon} label={AcceptanceStatusProps.justification_required.label} variant={AcceptanceStatusProps.justification_required.variant as TagProps['variant']} />;
	}

	if (grade === 'rejected') {
		return <Tag icon={AcceptanceStatusProps.rejected.icon} label={AcceptanceStatusProps.rejected.label} variant={AcceptanceStatusProps.rejected.variant as TagProps['variant']} />;
	}

	//
}

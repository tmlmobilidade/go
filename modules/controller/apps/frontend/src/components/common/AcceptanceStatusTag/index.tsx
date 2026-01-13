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

export const AcceptanceStatusProps = Object.freeze({
	accepted: {
		icon: <IconCheck />,
		label: 'controller:rides.detail.RidesDetailAcceptanceStatusTag.details.accepted',
		variant: 'success',
	},
	justification_required: {
		icon: <IconAlertCircle />,
		label: 'controller:rides.detail.RidesDetailAcceptanceStatusTag.details.justification_required',
		variant: 'warning',
	},
	rejected: {
		icon: <IconX />,
		label: 'controller:rides.detail.RidesDetailAcceptanceStatusTag.details.rejected',
		variant: 'danger',
	},
	under_review: {
		icon: <IconClock />,
		label: 'controller:rides.detail.RidesDetailAcceptanceStatusTag.details.under_review',
		variant: 'secondary',
	},
} as const);

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
		return <Tag icon={AcceptanceStatusProps.accepted.icon} label={t(AcceptanceStatusProps.accepted.label)} variant={AcceptanceStatusProps.accepted.variant as TagProps['variant']} />;
	}

	if (grade === 'under_review') {
		return <Tag icon={AcceptanceStatusProps.under_review.icon} label={t(AcceptanceStatusProps.under_review.label)} variant={AcceptanceStatusProps.under_review.variant as TagProps['variant']} />;
	}

	if (grade === 'justification_required') {
		return <Tag icon={AcceptanceStatusProps.justification_required.icon} label={t(AcceptanceStatusProps.justification_required.label)} variant={AcceptanceStatusProps.justification_required.variant as TagProps['variant']} />;
	}

	if (grade === 'rejected') {
		return <Tag icon={AcceptanceStatusProps.rejected.icon} label={t(AcceptanceStatusProps.rejected.label)} variant={AcceptanceStatusProps.rejected.variant as TagProps['variant']} />;
	}

	//
}

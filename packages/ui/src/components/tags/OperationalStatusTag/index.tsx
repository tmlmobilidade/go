'use client';

import { IconFlag3Filled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconX } from '@tabler/icons-react';
import { type OperationalStatus } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import { Tag } from '../Tag';

/* * */

interface OperationalStatusTagProps {
	value?: OperationalStatus
}

/* * */

export function OperationalStatusTag({ value }: OperationalStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (value === 'scheduled') {
		return <Tag icon={<IconPlayerTrackNextFilled />} label={t('shared:status.operational_status.scheduled')} variant="muted" />;
	}

	if (value === 'missed') {
		return <Tag icon={<IconX stroke={4} />} label={t('shared:status.operational_status.missed')} variant="danger" filled />;
	}

	if (value === 'running') {
		return <Tag icon={<IconPlayerPlayFilled />} label={t('shared:status.operational_status.running')} variant="primary" filled />;
	}

	if (value === 'ended') {
		return <Tag icon={<IconFlag3Filled />} label={t('shared:status.operational_status.ended')} variant="secondary" />;
	}

	//
}

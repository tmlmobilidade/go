/* * */

import { IconFlag3Filled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconX } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
/* * */

interface OperationalStatusTagProps {
	value?: RideNormalized['operational_status']
}

/* * */

export function OperationalStatusTag({ value }: OperationalStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('global', { keyPrefix: 'statuses' });

	//
	// B. Render components

	if (value === 'scheduled') {
		return <Tag icon={<IconPlayerTrackNextFilled />} label={t('scheduled')} variant="muted" />;
	}

	if (value === 'missed') {
		return <Tag icon={<IconX stroke={4} />} label={t('missed')} variant="danger" filled />;
	}

	if (value === 'running') {
		return <Tag icon={<IconPlayerPlayFilled />} label={t('running')} variant="primary" filled />;
	}

	if (value === 'ended') {
		return <Tag icon={<IconFlag3Filled />} label={t('ended')} variant="secondary" />;
	}

	//
}

'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/types';
import { Label, Section, Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';
/* * */

interface RidesListCellHeadsignProps {
	headsign: RideNormalized['headsign']
	patternId: RideNormalized['pattern_id']
}

/* * */

export function RidesListCellHeadsign({ headsign, patternId }: RidesListCellHeadsignProps) {
	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			<Tag label={patternId} variant="secondary" />
			<Label size="md" singleLine>{headsign}</Label>
			<IconAlertTriangle className={styles.alertIcon} size={16} />
		</Section>
	);
}

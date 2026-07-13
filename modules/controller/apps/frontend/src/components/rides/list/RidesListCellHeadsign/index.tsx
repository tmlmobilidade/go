'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { type RideNormalized } from '@tmlmobilidade/types';
import { Label, Section, Tag, Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface RidesListCellHeadsignProps {
	alertId?: string
	hasAlert: boolean
	headsign: RideNormalized['headsign']
	patternId: RideNormalized['pattern_id']
}

/* * */

export function RidesListCellHeadsign({ alertId, hasAlert, headsign, patternId }: RidesListCellHeadsignProps) {
	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			<Tag label={patternId} variant="secondary" />
			<Label size="md" singleLine>{headsign}</Label>
			{hasAlert && alertId && (
				<Tooltip label="alerta">
					<IconAlertTriangle
						className={styles.alertIcon}
						size={20}
					/>
				</Tooltip>
			)}
		</Section>
	);
}

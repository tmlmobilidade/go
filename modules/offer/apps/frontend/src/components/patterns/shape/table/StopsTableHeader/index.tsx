'use client';

import { IconArrowBarToDown, IconArrowBarUp, IconClock, IconSortAscendingNumbers } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

/* * */

export function StopsTableHeader() {
	const { t } = useTranslation();

	return (
		<div className={`${styles.row} ${styles.headerRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label={t('patterns:shape.StopsTableHeader.sequence')}>
					<IconSortAscendingNumbers size={20} />
				</Tooltip>
			</div>
			<div className={styles.column}>
				{t('patterns:shape.StopsTableHeader.stop')}
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label={t('patterns:shape.StopsTableHeader.timepoint')}>
					<IconClock size={20} />
				</Tooltip>
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label={t('patterns:shape.StopsTableHeader.pickup')}>
					<IconArrowBarToDown size={20} />
				</Tooltip>
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label={t('patterns:shape.StopsTableHeader.drop_off')}>
					<IconArrowBarUp size={20} />
				</Tooltip>
			</div>
			<div className={styles.column}>{t('patterns:shape.StopsTableHeader.segment_distance')}</div>
			<div className={styles.column}>{t('patterns:shape.StopsTableHeader.zones')}</div>
		</div>
	);
}

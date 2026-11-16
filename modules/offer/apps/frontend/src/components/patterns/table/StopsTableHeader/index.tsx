'use client';

import { IconSortAscendingNumbers } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

/* * */

export function StopsTableHeader() {
	const { t } = useTranslation();

	return (
		<div className={`${styles.row} ${styles.headerRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label={t('patterns:table.StopsTableHeader.sequence')}>
					<IconSortAscendingNumbers size={20} />
				</Tooltip>
			</div>
			<div className={styles.column}>{t('patterns:table.StopsTableHeader.stop')}</div>
			<div className={styles.column}>{t('patterns:table.StopsTableHeader.zones')}</div>
		</div>
	);
}

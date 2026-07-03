'use client';

import { IconSortAscendingNumbers } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function StopsTableHeader() {
	return (
		<div className={`${styles.row} ${styles.headerRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label="Sequência">
					<IconSortAscendingNumbers size={20} />
				</Tooltip>
			</div>
			<div className={styles.column}>Paragem</div>
			<div className={styles.column}>Afetação</div>
		</div>
	);
}

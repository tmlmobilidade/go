'use client';

import { IconArrowBarToDown, IconArrowBarUp, IconClock, IconSortAscendingNumbers } from '@tabler/icons-react';
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
			<div className={styles.column}>
				Paragem
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label="Timepoint">
					<IconClock size={20} />
				</Tooltip>
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label="Permite embarque">
					<IconArrowBarToDown size={20} />
				</Tooltip>
			</div>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Tooltip label="Permite desembarque">
					<IconArrowBarUp size={20} />
				</Tooltip>
			</div>
			<div className={styles.column}>Distância entre paragens</div>
			<div className={styles.column}>Afetação</div>
		</div>
	);
}

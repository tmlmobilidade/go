'use client';

import { useSelectedLine } from '@/hooks/use-selected-line';
import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function LinesDetailViewClose() {
	//

	//
	// A. Setup variables

	const { selectLineId } = useSelectedLine();

	//
	// B. Render components

	return (
		<div className={styles.button} onClick={() => selectLineId(null)}>
			<IconX size={30} />
		</div>
	);

	//
}

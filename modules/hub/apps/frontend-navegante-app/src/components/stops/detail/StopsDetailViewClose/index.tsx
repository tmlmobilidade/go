'use client';

import { useSelectedStop } from '@/hooks/use-selected-stop';
import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewClose() {
	//

	//
	// A. Setup variables

	const { selectStopId } = useSelectedStop();

	//
	// B. Render components

	return (
		<div className={styles.button} onClick={() => selectStopId(null)}>
			<IconX size={30} />
		</div>
	);

	//
}

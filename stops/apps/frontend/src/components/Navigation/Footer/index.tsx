'use client';

import { useStopListContext } from '@/contexts/StopList.context';

import styles from './styles.module.css';

/* * */

export default function Footer() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			Encontradas {stopListContext.data.raw.length} paragens
		</div>
	);
}

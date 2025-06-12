'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import React from 'react';

import styles from './styles.module.css';

export function Confirmation({ municipality }) {
	//

	const stopDetailsContext = useStopsDetailContext();

	//
	// A. Render components
	return (
		<div className={styles.container}>
			<div>{stopDetailsContext.data.form.getValues().name}</div>
			<div className={styles.location}>Localidade, {municipality}</div>
			<div className={styles.coords}>{stopDetailsContext.data.form.getValues().latitude}, {stopDetailsContext.data.form.getValues().longitude}</div>
		</div>
	);
}

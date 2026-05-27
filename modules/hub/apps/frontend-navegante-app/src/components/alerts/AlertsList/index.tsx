'use client';

import { useAlertsContext } from '@/contexts/Alerts.context';

import styles from './styles.module.css';

/* * */

export function AlertsList() {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{alertsContext.data.alerts.map((alert, index) => (
				<div key={index} className={styles.item}>
					{alert._id} - {alert.title}
				</div>
			))}
		</div>
	);
}

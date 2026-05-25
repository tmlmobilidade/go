'use client';

import styles from './styles.module.css';

/* * */

export function AlertsList() {
	return (
		<div className={styles.container}>
			{[...Array(100)].map((_, index) => (
				<div key={index} className={styles.item}>
					alerts list
					{index}
				</div>
			))}
		</div>
	);
}

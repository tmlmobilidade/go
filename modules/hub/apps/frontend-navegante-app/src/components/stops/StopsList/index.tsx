'use client';

import styles from './styles.module.css';

/* * */

export function StopsList() {
	return (
		<div className={styles.container}>
			{[...Array(100)].map((_, index) => (
				<div key={index} className={styles.item}>
					stops list
					{index}
				</div>
			))}
		</div>
	);
}

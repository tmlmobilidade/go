'use client';

import styles from './styles.module.css';

/* * */

export function LinesList() {
	return (
		<div className={styles.container}>
			{[...Array(100)].map((_, index) => (
				<div key={index} className={styles.item}>
					lines list
					{index}
				</div>
			))}
		</div>
	);
}

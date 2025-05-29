'use client';

import { IconChevronRight } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function Item({ id }) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{/* Left Side */}
			<div className={styles.containerInfo}>
				<div className={styles.details}>
					<div className={styles.id}>{id}</div>
					<div className={styles.name}>Alcochete | Circular</div>
				</div>
			</div>

			{/* Right Side */}
			<div className={styles.containerIcon}>
				<IconChevronRight />
			</div>
		</div>
	);
}

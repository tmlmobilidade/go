'use client';

/* * */

import styles from './styles.module.css';

/* * */

interface Props {
	title: string
}

/* * */

export function ViewportHeader({ title }: Props) {
	//

	// B. Render components

	return (
		<div className={styles.container}>
			<p className={styles.title}>{title}</p>
		</div>
	);

	//
}

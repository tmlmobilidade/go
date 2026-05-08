'use client';
/* * */

import styles from './styles.module.css';

/* * */

export function WebsiteViewport({ children }) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{children}
		</div>
	);

	//
}

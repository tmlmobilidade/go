'use client';

/* * */

import { ReactNode } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface ItemInterface {
	children: ReactNode
}

/* * */

export default function List({ children }: ItemInterface) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{children}
		</div>
	);
}

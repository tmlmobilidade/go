'use client';

/* * */

import { ReactNode } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface RowProps {
	children: ReactNode
	hasIcons?: boolean
}

/* * */

export default function Row({ children, hasIcons }: RowProps) {
	//

	//
	// A. Render components

	return (
		<div className={hasIcons ? styles.row_with_icons : styles.row}>
			{children}
		</div>
	);
}

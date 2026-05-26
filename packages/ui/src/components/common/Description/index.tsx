'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface DescriptionProps {
	singleLine?: boolean
}

/**
 * Description component to display descriptive text.
 */
export function Description({ children, singleLine = false }: PropsWithChildren<DescriptionProps>) {
	return (
		<p className={styles.root} data-single-line={singleLine}>
			{children}
		</p>
	);
}

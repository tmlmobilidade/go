'use client';

/* * */

import React from 'react';

import styles from './styles.module.css';

/* * */

export interface DescriptionProps {
	children?: React.ReactNode
	singleLine?: boolean
}

/* * */

export default function Description({ children, singleLine = false }: DescriptionProps) {
	return (
		<p className={styles.description} data-single-line={singleLine}>
			{children}
		</p>
	);
}

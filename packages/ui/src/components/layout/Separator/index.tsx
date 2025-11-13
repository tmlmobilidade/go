'use client';

/* * */

import styles from './styles.module.css';

/* * */

interface SeparatorProps {
	margin?: 'lg' | 'md' | 'none' | 'sm'
	separatorType?: 'dashed' | 'solid'
}

export function Separator({ margin = 'none', separatorType = 'solid' }: SeparatorProps) {
	return (
		<div
			className={styles.root}
			data-margin={margin}
			data-separator-type={separatorType}

		/>
	);
}

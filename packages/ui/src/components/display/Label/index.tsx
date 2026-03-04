/* * */

import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export interface LabelProps {
	caps?: boolean
	children?: ReactNode
	overflow?: boolean
	singleLine?: boolean
	size?: 'lg' | 'md' | 'sm'
	variant?: 'danger' | 'default' | 'muted' | 'primary' | 'success' | 'warning'
}

/* * */

export function Label({ caps = false, children, overflow = false, singleLine = false, size = 'md', variant }: LabelProps) {
	return (
		<p
			className={styles.label}
			data-caps={caps}
			data-overflow={overflow}
			data-single-line={singleLine}
			data-size={size}
			data-variant={variant}
		>
			{children}
		</p>
	);
}

/* * */

import { type IconProps } from '@tabler/icons-react';
import React from 'react';

import styles from './styles.module.css';

/* * */

export interface TagProps {
	filled?: boolean
	icon?: React.ReactNode
	label?: number | string
	onClick?: () => void
	variant?: 'danger' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

export function Tag({ filled = false, icon, label, onClick, variant = 'primary' }: TagProps) {
	return (
		<div className={styles.tag} data-clickable={!!onClick} data-filled={filled} data-variant={variant} onClick={onClick}>
			{React.isValidElement<IconProps>(icon) && <span className={styles.icon}>{React.cloneElement(icon)}</span>}
			{label !== null && label !== undefined && <span className={styles.label}>{label}</span>}
		</div>
	);
}

'use client';

import styles from './styles.module.css';

/* * */

interface ActionBarButtonProps {
	badgeCount?: number
	icon: React.ReactNode
	onClick?: () => void
	variant?: 'active' | 'default' | 'disabled'
}

/* * */

export function ActionBarButton({ badgeCount, icon, onClick, variant = 'default' }: ActionBarButtonProps) {
	return (
		<div className={styles.button} data-variant={variant} onClick={onClick}>
			{badgeCount && <div className={styles.badge}>{badgeCount}</div>}
			{icon}
		</div>
	);
}

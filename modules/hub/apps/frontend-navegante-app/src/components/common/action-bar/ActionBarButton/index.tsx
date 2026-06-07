'use client';

import styles from './styles.module.css';

/* * */

interface ActionBarButtonProps {
	badgeCount?: number
	icon: React.ReactNode
	label: string
	onClick?: () => void
	variant?: 'active' | 'default' | 'disabled'
}

/* * */

export function ActionBarButton({ badgeCount, icon, label, onClick, variant = 'default' }: ActionBarButtonProps) {
	return (
		<div
			aria-label={label}
			className={styles.button}
			data-variant={variant}
			onClick={onClick}
			role="button"
		>
			{badgeCount && <div className={styles.badge}>{badgeCount}</div>}
			{icon}
		</div>
	);
}

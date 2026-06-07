'use client';

import styles from './styles.module.css';

/* * */

interface ActionBarButtonProps {
	ariaHint: string
	ariaLabel: string
	badgeCount?: number
	icon: React.ReactNode
	onClick?: () => void
	variant?: 'active' | 'default' | 'disabled'
}

/* * */

export function ActionBarButton({ ariaHint, ariaLabel, badgeCount, icon, onClick, variant = 'default' }: ActionBarButtonProps) {
	return (
		<div
			aria-description={ariaHint}
			aria-label={ariaLabel}
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

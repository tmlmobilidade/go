'use client';

import styles from './styles.module.css';

/* * */

interface FloatingBarButtonProps {
	badgeCount?: number
	icon: React.ReactNode
	onClick: () => void
}

/* * */

export function FloatingBarButton({ badgeCount, icon, onClick }: FloatingBarButtonProps) {
	return (
		<div className={styles.button} onClick={onClick}>
			{badgeCount && <div className={styles.badge}>{badgeCount}</div>}
			{icon}
		</div>
	);
}

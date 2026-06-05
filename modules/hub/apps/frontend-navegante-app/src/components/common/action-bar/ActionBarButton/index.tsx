'use client';

import styles from './styles.module.css';

/* * */

interface ActionBarButtonProps {
	badgeCount?: number
	icon: React.ReactNode
	onClick: () => void
}

/* * */

export function ActionBarButton({ badgeCount, icon, onClick }: ActionBarButtonProps) {
	return (
		<div className={styles.button} onClick={onClick}>
			{badgeCount && <div className={styles.badge}>{badgeCount}</div>}
			{icon}
		</div>
	);
}

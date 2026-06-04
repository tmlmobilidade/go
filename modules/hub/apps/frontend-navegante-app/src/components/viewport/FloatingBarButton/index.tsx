'use client';

import styles from './styles.module.css';

/* * */

interface FloatingBarButtonProps {
	icon: React.ReactNode
	onClick: () => void
}

/* * */

export function FloatingBarButton({ icon, onClick }: FloatingBarButtonProps) {
	return (
		<div className={styles.button} onClick={onClick}>
			{icon}
		</div>
	);
}

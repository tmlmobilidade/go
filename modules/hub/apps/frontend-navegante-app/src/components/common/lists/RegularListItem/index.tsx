'use client';

import { IconChevronRight } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface RegularListItemProps {
	ariaLabel?: string
	children?: React.ReactNode
	icon?: React.ReactNode
	onClick: () => void
}

/* * */

export function RegularListItem({ ariaLabel, children, icon, onClick }: RegularListItemProps) {
	return (
		<button
			aria-label={ariaLabel}
			className={styles.container}
			onClick={onClick}
			type="button"
		>
			{icon && (
				<div aria-hidden="true" className={styles.iconWrapper}>
					{icon}
				</div>
			)}
			{children && (
				<div className={styles.childrenWrapper}>
					{children}
				</div>
			)}
			<div aria-hidden="true" className={styles.arrowWrapper}>
				<IconChevronRight size={20} />
			</div>
		</button>
	);
}

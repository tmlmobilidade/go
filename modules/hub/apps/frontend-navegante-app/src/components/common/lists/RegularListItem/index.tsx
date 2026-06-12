'use client';

import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { type RefObject } from 'react';

import styles from './styles.module.css';

/* * */

interface RegularListItemProps {
	ariaLabel?: string
	children?: React.ReactNode
	href?: string
	icon?: React.ReactNode
	onClick?: () => void
	refFn?: RefObject<HTMLDivElement>
	style?: React.CSSProperties
}

/* * */

export function RegularListItem({ ariaLabel, children, href, icon, onClick, refFn, style }: RegularListItemProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleClick = () => {
		if (onClick) onClick();
		else if (!href || href === '#') return;
		else router.push(href);
	};

	//
	// C. Render components

	return (
		<div
			ref={refFn || undefined}
			aria-label={ariaLabel}
			className={styles.container}
			data-disabled={href === '#'}
			onClick={handleClick}
			role="link"
			style={style}
		>
			{icon && (
				<div className={styles.iconWrapper}>
					{icon}
				</div>
			)}
			{children && (
				<div className={styles.childrenWrapper}>
					{children}
				</div>
			)}
			{href !== '#' && (
				<div className={styles.arrowWrapper}>
					<IconChevronRight size={20} />
				</div>
			)}
		</div>
	);
}

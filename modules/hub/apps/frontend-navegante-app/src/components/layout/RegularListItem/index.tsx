'use client';

import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { type RefObject } from 'react';

import styles from './styles.module.css';

/* * */

interface RegularListItemProps {
	ariaLabel?: string
	children?: React.ReactNode
	href: string
	icon?: React.ReactNode
	onClick?: () => void
	refFn?: RefObject<HTMLDivElement>
	style?: React.CSSProperties
}

/* * */

export function RegularListItem({ ariaLabel, children, href, icon, refFn, style }: RegularListItemProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleClick = () => {
		if (href === '#') return;
		router.push(href);
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
					<IconArrowNarrowRight size={20} />
				</div>
			)}
		</div>
	);
}

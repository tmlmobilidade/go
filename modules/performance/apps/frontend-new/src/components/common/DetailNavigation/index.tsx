/* * */

import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export interface DetailNavigationItem {
	href?: string
	id: string
	label: string
}

interface DetailNavigationProps {
	activeItemId: string
	ariaLabel: string
	items: DetailNavigationItem[]
}

/* * */

export function DetailNavigation({ activeItemId, ariaLabel, items }: DetailNavigationProps) {
	return (
		<nav aria-label={ariaLabel} className={styles.root}>
			{items.map(item => item.href ? (
				<Link
					key={item.id}
					aria-current={item.id === activeItemId ? 'page' : undefined}
					className={styles.item}
					data-active={item.id === activeItemId}
					href={item.href}
				>
					{item.label}
				</Link>
			) : (
				<span key={item.id} aria-disabled="true" className={styles.item} data-disabled="true">
					{item.label}
				</span>
			))}
		</nav>
	);
}

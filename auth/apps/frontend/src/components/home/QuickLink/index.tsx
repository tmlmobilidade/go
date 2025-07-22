/* * */

import { type QuickLink } from '@/types/quick-links';

import styles from './styles.module.css';

/* * */

interface QuickLinkButtonProps {
	item: QuickLink
}

/* * */

export function QuickLinkButton({ item }: QuickLinkButtonProps) {
	return (
		<a className={styles.container} href={item.href} target="_blank">
			<p className={styles.icon}>{item.icon}</p>
			<p className={styles.title}>{item.title}</p>
		</a>
	);
}

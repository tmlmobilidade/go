/* * */

import { type HomeLink } from '@/types/quick-links';

import styles from './styles.module.css';

/* * */

interface QuickLinkButtonProps {
	item: HomeLink
}

/* * */

export function QuickLinkButton({ item }: QuickLinkButtonProps) {
	return (
		<a className={styles.container} href={item.href} target="_blank">
			{item.icon}
			<p className={styles.title}>{item.title}</p>
		</a>
	);
}

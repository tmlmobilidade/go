/* * */

import { type HomeQuickLink } from '@tmlmobilidade/go-types-core';

import styles from './styles.module.css';

/* * */

interface HomeQuickLinkButtonProps {
	item: HomeQuickLink
}

/* * */

export function HomeQuickLinkButton({ item }: HomeQuickLinkButtonProps) {
	return (
		<a className={styles.container} href={item.href} target="_blank">
			{item.icon}
			<p className={styles.title}>{item.title}</p>
		</a>
	);
}

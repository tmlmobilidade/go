/* * */

import { type PropsWithChildren } from 'react';

import styles from '@/app/(non-authenticated)/home/styles.module.css';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className={styles.layout}>
			{children}
		</div>
	);
}

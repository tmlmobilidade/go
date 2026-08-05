/* * */

import { type PropsWithChildren, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	header: ReactNode
}

/* * */

export function VideowallLayout({ children, header }: PropsWithChildren<Props>) {
	return (
		<div className={styles.container}>
			{header}
			<div className={styles.content}>
				{children}
			</div>
		</div>
	);
}

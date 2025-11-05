/* * */

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export default function ComponentWrapper({ children }: PropsWithChildren) {
	return (
		<div className={styles.container}>
			<div className={styles.background} />
			<div className={styles.content}>{children}</div>
		</div>
	);
};

/* * */

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function PanelGrid({ children }: PropsWithChildren) {
	return <main className={styles.container}>{children}</main>;
}

/* * */

import { Children, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	layout: 'primaryWithFourDetails' | 'primaryWithTwoDetails' | 'single' | 'sixDetails' | 'twoRows'
}

/* * */

export function MetricGrid({ children, layout }: PropsWithChildren<Props>) {
	return (
		<div className={`${styles.container} ${styles[layout]}`}>
			{Children.map(children, child => (
				<div className={styles.cell}>
					{child}
				</div>
			))}
		</div>
	);
}

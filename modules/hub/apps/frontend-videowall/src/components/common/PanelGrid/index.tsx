/* * */

import { Children, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	fillContainer?: boolean
}

/* * */

export function PanelGrid({ children, fillContainer = false }: PropsWithChildren<Props>) {
	return (
		<main className={styles.container} data-fill-container={fillContainer}>
			{Children.map(children, child => (
				<div className={styles.cell}>
					{child}
				</div>
			))}
		</main>
	);
}

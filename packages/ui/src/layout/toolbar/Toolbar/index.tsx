/* * */

import { Scroller } from '@mantine/core';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface ToolbarProps extends PropsWithChildren {
	/**
	 * Keep the row inside the pane. Flexible children shrink instead of
	 * pushing later actions into the horizontal scroll.
	 */
	fit?: boolean
}

export function Toolbar({ children, fit = false }: ToolbarProps) {
	return (
		<Scroller
			edgeGradientColor="transparent"
			endControlIcon={<></>}
			showEndControl={false}
			showStartControl={false}
			startControlIcon={<></>}
			classNames={{
				container: fit ? `${styles.container} ${styles.fit}` : styles.container,
				content: fit ? `${styles.content} ${styles.fitContent}` : styles.content,
				control: styles.control,
			}}
		>
			{children}
		</Scroller>
	);
}

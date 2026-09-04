/* * */

import { Scroller } from '@mantine/core';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function Toolbar({ children }: PropsWithChildren) {
	return (
		<Scroller
			edgeGradientColor="transparent"
			endControlIcon={<></>}
			showEndControl={false}
			showStartControl={false}
			startControlIcon={<></>}
			classNames={{
				container: styles.container,
				content: styles.content,
				control: styles.control,
			}}
		>
			{children}
		</Scroller>
	);
}

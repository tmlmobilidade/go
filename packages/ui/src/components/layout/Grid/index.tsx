/* * */

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface GridProps {
	columns?: 'a' | 'aab' | 'aabc' | 'ab' | 'abb' | 'abc' | 'abcd' | 'abcde'
	gap?: 'lg' | 'md' | 'none' | 'sm' | 'xl' | 'xs'
	hAlign?: 'center' | 'end' | 'start'
	vAlign?: 'center' | 'end' | 'start'
}

/* * */

export function Grid({ children, columns = 'a', gap = 'none', hAlign = 'start', vAlign = 'start' }: PropsWithChildren<GridProps>) {
	return (
		<div
			className={styles.container}
			data-columns={columns}
			data-gap={gap}
			data-h-align={hAlign}
			data-v-align={vAlign}
		>
			{children}
		</div>
	);
}

/* * */

import { type HTMLAttributes, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	columns?: 'a' | 'aab' | 'aabc' | 'ab' | 'abb' | 'abc' | 'abcd' | 'abcde'
	gap?: 'lg' | 'md' | 'none' | 'sm' | 'xl' | 'xs'
	hAlign?: 'center' | 'end' | 'start'
	vAlign?: 'center' | 'end' | 'start'
}

/* * */

export function Grid({ children, className, columns = 'a', gap = 'none', hAlign = 'start', vAlign = 'start', ...props }: PropsWithChildren<GridProps>) {
	const rootClassName = className ? `${styles.container} ${className}` : styles.container;

	return (
		<div
			{...props}
			className={rootClassName}
			data-columns={columns}
			data-gap={gap}
			data-h-align={hAlign}
			data-v-align={vAlign}
		>
			{children}
		</div>
	);
}

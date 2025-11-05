/* * */

import styles from './styles.module.css';

/* * */

export interface SurfaceProps {
	align?: 'center' | 'end' | 'start'
	children: React.ReactNode
	height?: 'auto' | 'full'
	justify?: 'center' | 'end' | 'start'
	overflow?: 'auto' | 'hidden' | 'scroll'
	variant?: 'default' | 'transparent'
}

export function Surface({ align = 'start', children, height = 'auto', justify = 'start', overflow = 'hidden', variant = 'default' }: SurfaceProps) {
	return (
		<div className={styles.root} data-align={align} data-height={height} data-justify={justify} data-overflow={overflow} data-variant={variant}>
			{children}
		</div>
	);
}

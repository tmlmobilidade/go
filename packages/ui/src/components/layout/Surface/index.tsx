/* * */

import styles from './styles.module.css';

/* * */

export interface SurfaceProps {
	align?: 'center' | 'end' | 'start'
	children: React.ReactNode
	className?: string
	height?: 'auto' | 'full'
	justify?: 'center' | 'end' | 'start'
	overflow?: 'auto' | 'hidden' | 'scroll' | 'visible'
	variant?: 'default' | 'transparent'
}

export function Surface({ align = 'start', children, className, height = 'auto', justify = 'start', overflow = 'hidden', variant = 'default' }: SurfaceProps) {
	const combinedClassName = className ? `${styles.root} ${className}` : styles.root;

	return (
		<div className={combinedClassName} data-align={align} data-height={height} data-justify={justify} data-overflow={overflow} data-variant={variant}>
			{children}
		</div>
	);
}

/* * */

import styles from './styles.module.css';

/* * */

export interface SurfaceProps {
	align?: 'center' | 'end' | 'start'
	children: React.ReactNode
	className?: string
	elevated?: boolean
	height?: 'auto' | 'full'
	justify?: 'center' | 'end' | 'start'
	overflow?: 'auto' | 'hidden' | 'scroll' | 'visible'
	style?: React.CSSProperties
	variant?: 'bordered' | 'default' | 'primary' | 'transparent'
}

export function Surface({ align = 'start', children, className, elevated, height = 'auto', justify = 'start', overflow = 'hidden', style, variant = 'default' }: SurfaceProps) {
	const combinedClassName = className ? `${styles.root} ${className}` : styles.root;

	return (
		<div
			className={combinedClassName}
			data-align={align}
			data-elevated={elevated}
			data-height={height}
			data-justify={justify}
			data-overflow={overflow}
			data-variant={variant}
			style={style}
		>
			{children}
		</div>
	);
}

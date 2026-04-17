/* * */

import styles from './styles.module.css';

/* * */

interface SectionProps {
	alignItems?: 'center' | 'flex-end' | 'flex-start'
	children: React.ReactNode
	flexDirection?: 'column' | 'row'
	flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
	gap?: 'lg' | 'md' | 'sm' | 'xs' | null
	height?: React.CSSProperties['height']
	justifyContent?: 'center' | 'flex-end' | 'flex-start' | 'space-between'
	maxHeight?: React.CSSProperties['maxHeight']
	overflow?: React.CSSProperties['overflow']
	padding?: 'lg' | 'md' | 'none' | 'sm' | null
	width?: React.CSSProperties['width']
}

/* * */

export function Section({ alignItems = 'flex-start', children, flexDirection = 'column', flexWrap = 'nowrap', gap, height, justifyContent = 'flex-start', maxHeight, overflow, padding = 'md', width = '100%' }: SectionProps) {
	return (
		<div
			className={styles.root}
			data-align-items={alignItems}
			data-flex-direction={flexDirection}
			data-flex-wrap={flexWrap}
			data-gap={gap}
			data-justify-content={justifyContent}
			data-padding={padding}
			style={{ height, maxHeight, overflow, width }}
		>
			{children}
		</div>
	);
}

/* * */

import { type CSSProperties, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface SectionProps {
	alignItems?: 'center' | 'flex-end' | 'flex-start'
	className?: string
	flexDirection?: 'column' | 'row'
	flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
	gap?: 'lg' | 'md' | 'sm' | 'xs' | null
	height?: CSSProperties['height']
	justifyContent?: 'center' | 'flex-end' | 'flex-start' | 'space-between'
	maxHeight?: CSSProperties['maxHeight']
	overflow?: CSSProperties['overflow']
	padding?: 'lg' | 'md' | 'none' | 'sm' | null
	width?: CSSProperties['width']
}

/* * */

export function Section({ alignItems = 'flex-start', children, className, flexDirection = 'column', flexWrap = 'nowrap', gap, height, justifyContent = 'flex-start', maxHeight, overflow, padding = 'md', width = '100%' }: PropsWithChildren<SectionProps>) {
	return (
		<div
			className={`${styles.root} ${className ?? ''}`}
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

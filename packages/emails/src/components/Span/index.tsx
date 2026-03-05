/* * */

import colors from '@/styles/colors.js';
import { fontSize, fontWeight } from '@/styles/font.js';
import { type PropsWithChildren } from 'react';

/* * */

interface SpanProps {
	color?: 'danger' | 'info' | 'prose' | 'warning'
	size?: 'lg' | 'md' | 'sm'
	spaceAfter?: boolean
	spaceBefore?: boolean
	weight?: 'bold' | 'normal'
}

/**
 * Use this component to apply styles to inline text
 * within other components, such as Paragraph.
 */
export function Span({ children, color, size, spaceAfter, spaceBefore, weight }: PropsWithChildren<SpanProps>) {
	return (
		<>
			{spaceBefore && ' '}
			<span style={{
				color: color ? colors[color].foreground : undefined,
				fontSize: size ? fontSize[size] : undefined,
				fontWeight: weight ? fontWeight[weight] : undefined,
			}}
			>
				{children}
			</span>
			{spaceAfter && ' '}
		</>
	);
};

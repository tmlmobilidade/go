/* * */

import colors from '@/styles/colors.js';
import sizes from '@/styles/sizes.js';
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
				fontSize: size ? sizes.text[size] : undefined,
				fontWeight: weight ? weight : undefined,
			}}
			>
				{children}
			</span>
			{spaceAfter && ' '}
		</>
	);
};

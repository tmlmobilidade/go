/* * */

import React, { forwardRef } from 'react';

import styles from './styles.module.css';

/* * */

interface InlineProps extends React.ComponentPropsWithoutRef<'span'> {
	dotted?: boolean
}

/**
 * Component to render inline text with optional dotted underline.
 * Use this component to display inline information that may require
 * a ref (for example, for tooltips or popovers). Optional dotted underline
 * can be enabled via the `dotted` prop to indicate that additional information
 * is available on hover.
 */
export const Inline = forwardRef<HTMLSpanElement, InlineProps>(({ dotted, onClick, ...props }, ref) => (
	<span
		ref={ref}
		{...props}
		className={`${styles.inline} ${props.className || ''}`}
		data-clickable={!!onClick}
		data-dotted={dotted}
		onClick={onClick}
	>
		{props.children}
	</span>
));

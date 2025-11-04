import { Text } from '@react-email/components';
import React from 'react';

import styles from './styles.js';

export interface HighlightTextProps {
	as?: 'div' | 'span'
	children: React.ReactNode
	size?: 'normal' | 'small'
	variant?: 'error' | 'highlight' | 'info' | 'muted' | 'success' | 'warning'
}

export function HighlightText({
	as = 'span',
	children,
	size = 'normal',
	variant = 'highlight',
}: HighlightTextProps) {
	// Override with variant-specific styles if not using 'small' size
	const finalStyle = size === 'normal' ? styles.textStyles[variant] : {
		...styles.textStyles.small,
		...(variant !== 'highlight' && variant !== 'muted' ? { color: styles.colors[variant].text } : {}),
		...(variant === 'muted' ? { color: styles.colors.muted.text } : {}),
	};

	if (as === 'span') {
		return <span style={finalStyle}>{children}</span>;
	}

	return (
		<Text style={finalStyle}>
			{children}
		</Text>
	);
}

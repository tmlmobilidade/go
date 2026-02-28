/* * */

import colors from '@/styles/colors.js';
import sizes from '@/styles/sizes.js';
import { Text } from '@react-email/components';
import { type PropsWithChildren } from 'react';

import styles from './styles.js';

/* * */

interface ParagraphProps {
	bold?: boolean
	color?: 'danger' | 'info' | 'prose' | 'success' | 'warning'
	size?: 'lg' | 'md' | 'sm'
}

/* * */

export function Paragraph({ bold, children, color = 'prose', size = 'lg' }: PropsWithChildren<ParagraphProps>) {
	return (
		<Text style={{
			...styles.text,
			color: colors[color].foreground,
			fontSize: sizes.text[size],
			fontWeight: bold ? 'bold' : 'normal',
		}}
		>
			{children}
		</Text>
	);
};

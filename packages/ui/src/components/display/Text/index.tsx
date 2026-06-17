/* * */

import { Text as MantineText, type TextProps as MantineTextProps } from '@mantine/core';

/* * */

export interface TextProps extends MantineTextProps {
	children: React.ReactNode
	size?: '2xl' | 'base' | 'lg' | 'sm' | 'xl' | 'xs'
	weight?: 'bold' | 'extra-bold' | 'medium' | 'semibold'
}

/* * */

export function Text({ children, size = 'base', weight = 'medium', ...props }: TextProps) {
	return (
		<MantineText data-size={size} data-weight={weight} {...props}>
			{children}
		</MantineText>
	);
}

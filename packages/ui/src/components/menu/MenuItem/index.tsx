'use client';

import { Menu, Stack } from '@mantine/core';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { Text } from '../../display/Text';

/* * */

interface MenuItemProps {
	color?: string
	description?: ReactNode
	disabled?: boolean
	href?: string
	leftSection?: ReactNode
	onClick?: () => void
	rel?: string
	rightSection?: ReactNode
	target?: string
	title: ReactNode
}

/* * */

export function MenuItem({
	color,
	description,
	disabled,
	href,
	leftSection,
	onClick,
	rel,
	rightSection,
	target,
	title,
}: MenuItemProps) {
	return (
		<Menu.Item
			color={color}
			component={href ? Link : 'button'}
			disabled={disabled}
			href={href}
			leftSection={leftSection}
			onClick={onClick}
			rel={rel}
			rightSection={rightSection}
			target={target}
		>
			<Stack gap={0}>
				<Text fw={700} size="sm">
					{title}
				</Text>

				{description && (
					<Text size="xs" variant="muted">
						{description}
					</Text>
				)}
			</Stack>
		</Menu.Item>
	);
}

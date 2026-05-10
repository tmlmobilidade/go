'use client';

import { Menu, Stack } from '@mantine/core';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { Text } from '../../display/Text';

/* * */

interface TopbarMenuItemProps {
	description?: ReactNode
	href?: string
	onClick?: () => void
	rel?: string
	target?: string
	title: ReactNode
}

/* * */

export function TopbarMenuItem({
	description,
	href,
	onClick,
	rel,
	target,
	title,
}: TopbarMenuItemProps) {
	return (
		<Menu.Item
			component={href ? Link : 'button'}
			href={href}
			onClick={onClick}
			rel={rel}
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

'use client';

/* * */

import { ActionIcon, Menu, Stack, Text } from '@mantine/core';
import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Event } from '@tmlmobilidade/types';
import { keepUrlParams, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface EventsDetailPatternsMenuProps {
	patterns?: Event['associated_patterns']
}

/* * */

export function EventsDetailPatternsMenu({ patterns }: EventsDetailPatternsMenuProps) {
	//

	//
	// A. Setup variables

	const counterText = patterns?.length ? (patterns.length > 99 ? '99+' : patterns.length.toString()) : undefined;

	const actionButton = (
		<ActionIcon
			className={styles.target}
			color="var(--color-primary)"
			variant="subtle"
		>
			<IconEye size={24} />
			{counterText && <div className={styles.counter}>{counterText}</div>}
		</ActionIcon>
	);

	//
	// B. Render components

	return (
		<Menu offset={0} position="bottom-end" shadow="lg" width={320} withArrow>
			<Menu.Target>
				<Tooltip label="Ver patterns associados" position="bottom" withArrow>
					{actionButton}
				</Tooltip>
			</Menu.Target>

			<Menu.Dropdown style={{ maxHeight: '70%', overflowY: 'auto' }}>
				{!patterns || patterns.length === 0 ? (
					<Stack align="center" gap={6} p="md">
						<IconRouteOff size={20} stroke={1.8} />
						<Text c="dimmed" size="sm">
							Sem patterns associados
						</Text>
					</Stack>
				) : (
					<>
						<Menu.Label>Patterns associados</Menu.Label>

						{patterns.map(pattern => (
							<Menu.Item
								key={pattern._id}
								component={Link}
								href={keepUrlParams(PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern._id, pattern.route_id))}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Stack gap={0}>
									<Text fw={700} size="sm">
										{pattern.code}
									</Text>
									<Text c="dimmed" size="xs">
										{pattern.headsign}
									</Text>
								</Stack>
							</Menu.Item>
						))}
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);

	//
}

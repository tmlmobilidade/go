'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export interface ToolbarActionsItemType {
	icon: React.ReactNode
	label: string
	onClick: () => void
}

export interface ToolbarActionsGroupType {
	actions: ToolbarActionsItemType[]
	label: string
}

interface ToolbarActionsProps {
	groups: ToolbarActionsGroupType[]
}

/* * */

export function ToolbarActions({ groups }: PropsWithChildren<ToolbarActionsProps>) {
	//

	//
	// B. Render components

	return (
		<Menu withArrow>

			<Menu.Target>
				<ActionIcon color="gray" variant="subtle">
					<IconDots size={24} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				{groups.map(group => (
					<Fragment key={group.label}>

						<Menu.Label>{group.label}</Menu.Label>

						{group.actions.map(action => (
							<Menu.Item
								key={action.label}
								leftSection={action.icon}
								onClick={action.onClick}
							>
								{action.label}
							</Menu.Item>
						))}

					</Fragment>
				))}
			</Menu.Dropdown>

		</Menu>
	);
}

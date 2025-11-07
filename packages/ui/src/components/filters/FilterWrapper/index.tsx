/* * */

import { Popover } from '@mantine/core';
import { type PropsWithChildren } from 'react';

import { FilterTarget } from '../FilterTarget';

/* * */

interface FilterWrapperProps {
	active?: boolean
	disabled?: boolean
	label: string
}

/* * */

export function FilterWrapper({ active, children, disabled, label }: PropsWithChildren<FilterWrapperProps>) {
	return (
		<Popover position="bottom" withArrow>
			<Popover.Target>
				<FilterTarget
					active={active}
					disabled={disabled}
					label={label}
				/>
			</Popover.Target>
			<Popover.Dropdown>
				{children}
			</Popover.Dropdown>
		</Popover>
	);
};

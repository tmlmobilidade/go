'use client';

import { Popover } from '@mantine/core';
import { forwardRef, type PropsWithChildren, useImperativeHandle, useState } from 'react';

import { FilterTarget } from '../FilterTarget';

/* * */

interface FilterWrapperProps {
	active?: boolean
	disabled?: boolean
	label: string
	onClose?: () => void
}

export interface FilterWrapperRef {
	close: () => void
}

/* * */

export const FilterWrapper = forwardRef<FilterWrapperRef, PropsWithChildren<FilterWrapperProps>>(
	({ active, children, disabled, label, onClose }, ref) => {
		const [opened, setOpened] = useState(false);

		useImperativeHandle(ref, () => ({
			close: () => {
				setOpened(false);
				onClose?.();
			},
		}));

		const handleChange = (newOpened: boolean) => {
			setOpened(newOpened);
			if (!newOpened) onClose?.();
		};

		return (
			<Popover
				onChange={handleChange}
				opened={opened}
				position="bottom"
				withArrow
			>
				<Popover.Target>
					<div
						onClick={() => {
							if (!disabled) setOpened(true);
						}}
					>
						<FilterTarget
							active={active}
							disabled={disabled}
							label={label}
						/>
					</div>
				</Popover.Target>

				<Popover.Dropdown>
					{children}
				</Popover.Dropdown>
			</Popover>
		);
	},
);

FilterWrapper.displayName = 'FilterWrapper';

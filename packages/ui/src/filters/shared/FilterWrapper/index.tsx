'use client';

import { Popover } from '@mantine/core';
import { forwardRef, type PropsWithChildren, useImperativeHandle, useState } from 'react';

import { FilterTarget } from '../FilterTarget';

/* * */

interface FilterWrapperProps {
	active?: boolean
	disabled?: boolean
	label: string
	loading?: boolean
	onClose?: () => void
}

export interface FilterWrapperRef {
	close: () => void
}

/* * */

export const FilterWrapper = forwardRef<FilterWrapperRef, PropsWithChildren<FilterWrapperProps>>(({ active, children, disabled, label, loading, onClose }, ref) => {
	//

	//
	// A. Setup variables

	const [opened, setOpened] = useState(false);

	//
	// B. Handle actions

	useImperativeHandle(ref, () => ({
		close: () => {
			setOpened(false);
			onClose?.();
		},
	}));

	const handleToggleOpen = () => {
		if (!disabled && !loading) setOpened(prev => !prev);
	};

	const handleChange = (newOpened: boolean) => {
		setOpened(newOpened);
		if (!newOpened) onClose?.();
	};

	//
	// C. Render components

	return (
		<Popover
			disabled={disabled || loading}
			onChange={handleChange}
			opened={opened}
			position="bottom"
			withArrow
		>
			<Popover.Target>
				<FilterTarget
					active={active}
					disabled={disabled}
					label={label}
					loading={loading}
					onClick={handleToggleOpen}
				/>
			</Popover.Target>

			<Popover.Dropdown>
				{children}
			</Popover.Dropdown>
		</Popover>
	);
},
);

FilterWrapper.displayName = 'FilterWrapper';

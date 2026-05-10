'use client';

import {
	Popover as MantinePopover,
	PopoverDropdownProps as MantinePopoverDropdownProps,
	PopoverProps as MantinePopoverProps,
	PopoverTargetProps as MantinePopoverTargetProps,
} from '@mantine/core';

export type PopoverProps = MantinePopoverProps;
export type PopoverTargetProps = MantinePopoverTargetProps;
export type PopoverDropdownProps = MantinePopoverDropdownProps;

export function Popover(props: PopoverProps) {
	return <MantinePopover {...props} />;
}

Popover.Target = function PopoverTarget(props: PopoverTargetProps) {
	return <MantinePopover.Target {...props} />;
};

Popover.Dropdown = function PopoverDropdown(props: PopoverDropdownProps) {
	return <MantinePopover.Dropdown {...props} />;
};

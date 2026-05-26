'use client';

import { Checkbox as MantineCheckbox, type CheckboxGroupProps as MantineCheckboxGroupProps, type CheckboxProps as MantineCheckboxProps } from '@mantine/core';

/* * */

export type CheckboxProps = MantineCheckboxProps;
export type CheckboxGroupProps = MantineCheckboxGroupProps;

/* * */

export function Checkbox(props: CheckboxProps) {
	return <MantineCheckbox {...props} />;
}

Checkbox.Group = function CheckboxGroup(props: MantineCheckboxGroupProps) {
	return <MantineCheckbox.Group {...props} />;
};

'use client';

import { MonthPickerInput as MantineMonthPickerInput, MonthPickerInputProps as MantineMonthPickerInputProps } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export interface MonthPickerProps extends Omit<MantineMonthPickerInputProps, 'type'> {

	/**
	 * Full width of the input.
	 */
	fullWidth?: boolean

	/**
	 * Left section of the input.
	 * @default <IconCalendar size={20} />
	 */
	leftSection?: React.ReactNode

}

/* * */

export function MonthPicker({ leftSection = <IconCalendar size={20} />, ...props }: MonthPickerProps) {
	return (
		<MantineMonthPickerInput
			classNames={{ ...styles, ...props.classNames }}
			leftSection={leftSection}
			style={{ width: props.fullWidth ? '100%' : undefined }}
			type="default"
			{...props}
		/>
	);
}

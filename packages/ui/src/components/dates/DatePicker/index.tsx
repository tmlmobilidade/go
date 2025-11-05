'use client';

/* * */

import { DatePickerInput as MantineDatePickerInput, DatePickerInputProps as MantineDatePickerInputProps } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export interface DatePickerProps extends Omit<MantineDatePickerInputProps, 'type'> {

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

export function DatePicker({ leftSection = <IconCalendar size={20} />, ...props }: DatePickerProps) {
	return (
		<MantineDatePickerInput
			classNames={{ ...styles, ...props.classNames }}
			leftSection={leftSection}
			style={{ width: props.fullWidth ? '100%' : undefined }}
			type="default"
			{...props}
		/>
	);
}

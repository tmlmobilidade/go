'use client';

import { YearPickerInput as MantineYearPickerInput, YearPickerInputProps as MantineYearPickerInputProps } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export interface YearPickerProps extends Omit<MantineYearPickerInputProps, 'type'> {

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

export function YearPicker({ leftSection = <IconCalendar size={20} />, ...props }: YearPickerProps) {
	return (
		<MantineYearPickerInput
			classNames={{ ...styles, ...props.classNames }}
			leftSection={leftSection}
			style={{ width: props.fullWidth ? '100%' : undefined }}
			type="default"
			{...props}
		/>
	);
}

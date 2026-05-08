'use client';

import { SegmentedControl as MantineSegmentedControl, type SegmentedControlProps as MantineSegmentedControlProps } from '@mantine/core';

/* * */

export interface SegmentedControlDataItem {
	disabled?: boolean
	label: React.ReactNode | string
	value: string
};

/* * */

export interface SegmentedControlProps extends Omit<MantineSegmentedControlProps, 'data'> {

	/**
	 * The data items to be displayed in the SegmentedControl component.
	 * Use the `SegmentedControlDataItem` interface to define properties for each item.
	 */
	data?: SegmentedControlDataItem[]

	/**
	 * If true, the SegmentedControl will take the full width of its container.
	 * @default false
	 */
	fullWidth?: boolean

}

/* * */

export function SegmentedControl(props: SegmentedControlProps) {
	return (
		<MantineSegmentedControl
			data={props.data}
			style={{ width: props.fullWidth ? '100%' : undefined }}
			{...props}
		/>
	);
}

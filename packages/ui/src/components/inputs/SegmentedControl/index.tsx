'use client';

import { SegmentedControl as MantineSegmentedControl, type SegmentedControlProps as MantineSegmentedControlProps } from '@mantine/core';
import { type CSSProperties, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export interface SegmentedControlDataItem {
	disabled?: boolean
	label: ReactNode | string
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
	 * Optional description text displayed next to the input label treatment.
	 */
	description?: ReactNode

	/**
	 * If true, the SegmentedControl will take the full width of its container.
	 * @default false
	 */
	fullWidth?: boolean

	/**
	 * Optional label displayed above the segmented control.
	 */
	label?: ReactNode

}

/* * */

export function SegmentedControl({ data, description, fullWidth, label, style, ...props }: SegmentedControlProps) {
	const segmentedControlStyle: CSSProperties = {
		...(style as CSSProperties | undefined),
		...(fullWidth ? { width: '100%' } : {}),
	};

	return (
		<div className={styles.root} data-full-width={fullWidth}>
			{label && <p className={styles.label}>{label}</p>}
			{description && <p className={styles.description}>{description}</p>}
			<MantineSegmentedControl
				data={data}
				style={segmentedControlStyle}
				{...props}
			/>
		</div>
	);
}

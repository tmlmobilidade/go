'use client';

/* * */

import { SegmentedControl as MantineSegmentedControl, type SegmentedControlProps as MantineSegmentedControlProps } from '@mantine/core';

/* * */

export interface SegmentedControlProps extends MantineSegmentedControlProps {
	fullWidth?: boolean
}

/* * */

export function SegmentedControl({ fullWidth, ...props }: SegmentedControlProps) {
	return (
		<MantineSegmentedControl
			style={{ width: fullWidth ? '100%' : undefined }}
			{...props}
		/>
	);
}

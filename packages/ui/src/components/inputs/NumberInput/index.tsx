'use client';

import { Center, NumberInput as MantineNumberInput, NumberInputProps as MantineNumberInputProps, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

/* * */

export interface NumberInputProps extends MantineNumberInputProps {
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
	tooltip?: string
}

/* * */

export function NumberInput(props: NumberInputProps) {
	//

	const renderTooltip = (tooltip?: string) => (
		<Tooltip
			label={tooltip}
			position="top-end"
			transitionProps={{ transition: 'pop-bottom-right' }}
			withArrow
		>
			<Center style={{ cursor: 'help' }}>
				<IconInfoCircle size={20} />
			</Center>
		</Tooltip>
	);

	return (
		<MantineNumberInput
			rightSection={props.tooltip && renderTooltip(props.tooltip)}
			{...props}
		/>
	);

	//
}

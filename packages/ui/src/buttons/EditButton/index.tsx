'use client';

import { ActionIcon } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import { Tooltip } from '../../components/common/Tooltip';

/* * */

interface EditButtonProps {

	/**
	 * Flag to indicate if the button is disabled.
	 */
	isDisabled?: boolean

	/**
	 * Flag to indicate if the button is in loading state.
	 */
	isLoading?: boolean

	/**
	 * Callback function to execute when the edit action is confirmed.
	 */
	onEdit: () => void

}

/* * */

export function EditButton(props: EditButtonProps) {
	return (
		<Tooltip
			label="Editar"
			position="bottom"
			withArrow
		>
			<ActionIcon
				color="var(--color-primary)"
				disabled={props.isDisabled}
				loading={props.isLoading}
				onClick={props.onEdit}
				variant="subtle"
			>
				<IconPencil />
			</ActionIcon>
		</Tooltip>
	);
}

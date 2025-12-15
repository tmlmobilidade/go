'use client';

/* * */

import { ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';

import { Tooltip } from '../../common/Tooltip';
import { Label } from '../../display/Label';

/* * */

interface DeleteButtonWithConfirmationProps {

	/**
	 * Label for the cancel button.
	 * @default 'Cancelar'
	 */
	cancelLabel?: string

	/**
	 * Label for the confirm button.
	 * @default 'Eliminar'
	 */
	confirmLabel?: string

	/**
	 * Message to display in the confirmation modal.
	 */
	confirmMessage: string

	/**
	 * Title of the confirmation modal.
	 */
	confirmTitle: string

	/**
	 * Callback function to execute when the cancel button is clicked.
	 */
	onCancel?: () => void

	/**
	 * Callback function to execute when the confirm button is clicked.
	 */
	onDelete: () => void

	/**
	 * Flag to indicate if the confirmation modal should be shown.
	 */
	showConfirmation: true

}

/**
 * Props for hiding confirmation modal.
 */
interface DeleteButtonWithoutConfirmationProps {

	/**
	 * Callback function to execute when the action icon is clicked.
	 */
	onDelete: () => void

	/**
	 * Flag to indicate if the confirmation modal should be hidden.
	 */
	showConfirmation?: false | undefined

}

type DeleteButtonProps = (DeleteButtonWithConfirmationProps | DeleteButtonWithoutConfirmationProps);

/* * */

export function DeleteButton(props: DeleteButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		if (props.showConfirmation) {
			modals.openConfirmModal({
				children: props.confirmMessage,
				confirmProps: {
					variant: 'danger',
				},
				labels: {
					cancel: props.cancelLabel ?? 'Cancelar',
					confirm: props.confirmLabel ?? 'Eliminar',
				},
				onCancel: props.onCancel,
				onConfirm: props.onDelete,
				title: <Label caps>{props.confirmTitle}</Label>,
			});
		}
		else {
			props.onDelete();
		}
	};

	//
	// B. Render components

	return (
		<Tooltip
			label="Eliminar"
			position="bottom"
			withArrow
		>
			<ActionIcon
				color="var(--color-status-danger-primary)"
				onClick={handleClick}
				variant="subtle"
			>
				<IconTrash />
			</ActionIcon>
		</Tooltip>
	);

	//
}

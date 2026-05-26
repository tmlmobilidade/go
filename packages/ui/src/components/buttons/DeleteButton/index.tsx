'use client';

import { ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconRestore, IconTrash } from '@tabler/icons-react';

import { Tooltip } from '../../common/Tooltip';
import { Label } from '../../display/Label';

/* * */

interface DeleteButtonBaseProps {

	/**
	 * Flag to indicate if the item is deleted.
	 */
	isDeleted?: boolean

	/**
	 * Flag to indicate if the button is disabled.
	 */
	isDisabled?: boolean

	/**
	 * Flag to indicate if the button is in loading state.
	 */
	isLoading?: boolean

	/**
	 * Callback function to execute when the delete action is confirmed.
	 */
	onDelete: () => void

	/**
	 * Callback function to execute when the restore action is confirmed.
	 */
	onRestore?: () => void

}

interface DeleteButtonWithConfirmationProps extends DeleteButtonBaseProps {

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
	 * Flag to indicate if the confirmation modal should be shown.
	 */
	showConfirmation: true

}

/**
 * Props for hiding confirmation modal.
 */
interface DeleteButtonWithoutConfirmationProps extends DeleteButtonBaseProps {

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

	const handleDelete = () => {
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
		} else {
			props.onDelete();
		}
	};

	const handleRestore = () => {
		if (props.onRestore) props.onRestore();
	};

	//
	// B. Render components

	if (props.isDeleted) {
		return (
			<Tooltip
				label="Recuperar"
				position="bottom"
				withArrow
			>
				<ActionIcon
					color="var(--color-status-warning-primary)"
					disabled={props.isDisabled}
					loading={props.isLoading}
					onClick={handleRestore}
					variant="subtle"
				>
					<IconRestore />
				</ActionIcon>
			</Tooltip>
		);
	}

	return (
		<Tooltip
			label="Eliminar"
			position="bottom"
			withArrow
		>
			<ActionIcon
				color="var(--color-status-danger-primary)"
				disabled={props.isDisabled}
				loading={props.isLoading}
				onClick={handleDelete}
				variant="subtle"
			>
				<IconTrash />
			</ActionIcon>
		</Tooltip>
	);

	//
}

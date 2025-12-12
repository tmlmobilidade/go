'use client';

/* * */

import { ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

/**
 * Props for showing confirmation modal.
 */
interface DeleteButtonWithConfirmationProps {

	/**
	 * Label for the cancel button.
	 * @default 'Cancelar'
	 */
	cancelLabel?: string

	/**
	 * Label for the confirm button.
	 * @default 'Confirmar'
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

type DeleteButtonProps = (DeleteButtonWithConfirmationProps | DeleteButtonWithoutConfirmationProps) & {
	size?: 'lg' | 'md' | 'sm'
	variant?: 'danger' | 'subtle'
};

/* * */

export function DeleteButton({ size = 'md', variant = 'danger', ...props }: DeleteButtonProps) {
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
				title: props.confirmTitle,
			});
		}
		else {
			props.onDelete();
		}
	};

	//
	// C. Render components

	return (
		<ActionIcon classNames={{ root: styles.root }} data-variant={variant} onClick={handleClick} variant={variant}>
			<IconTrash size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
		</ActionIcon>
	);

	//
}

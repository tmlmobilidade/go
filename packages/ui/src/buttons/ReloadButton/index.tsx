'use client';

import { ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconReload } from '@tabler/icons-react';

import { Tooltip } from '../../components/common/Tooltip';
import { Label } from '../../components/display/Label';

/* * */

interface ReloadButtonBaseProps {

	/**
	 * Flag to indicate if the button is disabled.
	 */
	isDisabled?: boolean

	/**
	 * Flag to indicate if the button is in loading state.
	 */
	isLoading?: boolean

	/**
	 * Callback function to execute when the reload action is confirmed.
	 */
	onReload: () => void

}

interface ReloadButtonWithConfirmationProps extends ReloadButtonBaseProps {

	/**
	 * Label for the cancel button.
	 * @default 'Cancelar'
	 */
	cancelLabel?: string

	/**
	 * Label for the confirm button.
	 * @default 'Recarregar'
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
interface ReloadButtonWithoutConfirmationProps extends ReloadButtonBaseProps {

	/**
	 * Flag to indicate if the confirmation modal should be hidden.
	 */
	showConfirmation?: false | undefined

}

type ReloadButtonProps = (ReloadButtonWithConfirmationProps | ReloadButtonWithoutConfirmationProps);

/* * */

export function ReloadButton(props: ReloadButtonProps) {
	//

	//
	// A. Handle actions

	const handleReload = () => {
		if (props.showConfirmation) {
			modals.openConfirmModal({
				children: props.confirmMessage,
				labels: {
					cancel: props.cancelLabel ?? 'Cancelar',
					confirm: props.confirmLabel ?? 'Recarregar',
				},
				onCancel: props.onCancel,
				onConfirm: props.onReload,
				title: <Label caps>{props.confirmTitle}</Label>,
			});
		} else {
			props.onReload();
		}
	};

	//
	// B. Render components

	return (
		<Tooltip
			label="Recarregar"
			position="bottom"
			withArrow
		>
			<ActionIcon
				color="blue"
				disabled={props.isDisabled}
				loading={props.isLoading}
				onClick={handleReload}
				variant="subtle"
			>
				<IconReload />
			</ActionIcon>
		</Tooltip>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, closeModal, DatePicker, Grid, Label, openModal, Section, Text } from '@tmlmobilidade/ui';
import { ReactNode, useState } from 'react';

/* * */

const EDIT_FIELD_MODAL_ID = 'edit-field-modal';

interface EditDateModalProps {
	description?: ReactNode | string
	label: ReactNode | string
	onConfirm: (value: string) => void
	value: any
}

export const OpenEditDateModal = ({ description, label, onConfirm, value }: EditDateModalProps) => {
	openModal({
		children: (
			<EditDateModal description={description} label={label} onConfirm={onConfirm} value={value} />
		),
		modalId: EDIT_FIELD_MODAL_ID,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export default function EditDateModal({ description, label, onConfirm, value }: EditDateModalProps) {
	//
	const [contextValue, setContextValue] = useState(value);

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(EDIT_FIELD_MODAL_ID)} variant="danger" fullWidth />
			<Button
				label="Confirmar"
				onClick={handleConfirm}
				variant="primary"
				fullWidth
			/>
		</Grid>
	);

	const renderDescription = () => {
		if (typeof description === 'string') {
			return <Text size="base">{description}</Text>;
		}
		return description;
	};

	const renderLabel = () => {
		if (typeof label === 'string') {
			return <Label caps>{label}</Label>;
		}
		return label;
	};

	const handleConfirm = () => {
		onConfirm(contextValue);
		closeModal(EDIT_FIELD_MODAL_ID);
	};

	return (
		<Section gap="lg" padding="lg">
			{renderLabel()}
			{renderDescription()}

			{contextValue}
			<div style={{ width: '100%' }}>
				<DatePicker onChange={setContextValue} value={contextValue} />
			</div>
			{renderActionButtons()}
		</Section>
	);
}

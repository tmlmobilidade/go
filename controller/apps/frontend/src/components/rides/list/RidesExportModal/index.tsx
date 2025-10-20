'use client';

/* * */

import { IconFileDownload } from '@tabler/icons-react';
import { Button, closeModal, DateTimePicker, Divider, Grid, Label, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';

import { RidesExportModalContextProvider, useRidesExportModalContext } from './context';

/* * */

export const RIDES_EXPORT_MODAL_ID = 'rides-export-modal';

/* * */

export const openRideExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<RidesExportModalContextProvider>
					<RidesExportModal />
				</RidesExportModalContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: RIDES_EXPORT_MODAL_ID,
		padding: 0,
		size: 'auto',
		styles: { content: { overflow: 'unset' } },
		withCloseButton: false,
	});
};

/* * */

export default function RidesExportModal() {
	//

	//
	// A. Setup variables
	const context = useRidesExportModalContext();

	//
	// B. Render Components

	return (
		<div style={{ minHeight: '200px' }}>
			<Section>
				<Label size="lg" caps>Exportar Circulações</Label>
				<Text>Selecione o intervalo de datas para a exportação das circulações.</Text>
			</Section>

			<Divider />
			<Section>
				<Grid columns="ab" gap="md">
					<DateTimePicker
						onChange={context.actions.onStartDateChange}
						placeholder="Data de Início"
						value={context.data.startDate}
						fullWidth
					/>
					<DateTimePicker
						onChange={value => context.actions.onEndDateChange(value)}
						placeholder="Data de Fim"
						value={context.data.endDate}
						fullWidth
					/>
				</Grid>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={context.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(RIDES_EXPORT_MODAL_ID)}
						variant="danger"
					/>
					<Button
						disabled={!context.flags.canSave}
						icon={<IconFileDownload />}
						label="Exportar Circulações"
						loading={context.flags.loading}
						// onClick={context.actions.exportRides}
					/>
				</Grid>
			</Section>

		</div>
	);

	//
}

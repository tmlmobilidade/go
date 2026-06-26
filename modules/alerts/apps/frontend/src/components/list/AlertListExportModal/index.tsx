'use client';

import { DataProviders } from '@/providers/data-providers';
import { Button, closeModal, Divider, Grid, Label, openModal, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

import { AlertsListExportContextProvider, useAlertsListExportContext } from '../AlertListExport.context';
import { AlertsListContextProvider } from '../AlertsList.context';

/* * */

const MODAL_ID = 'alert-list-export-modal';

/* * */

export function AlertListExportModal() {
	//

	//
	// A. Setup variables

	const alertListExportContext = useAlertsListExportContext();

	//
	// B. Render components

	return (
		<Pane
			header={[
				<Toolbar key="stop-list-export-toolbar">
					<Label size="lg" singleLine>Exportar zonas</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<Section gap="sm">
				<Label size="sm" caps>Filtros ativos na lista</Label>
				{alertListExportContext.filters.length === 0 && (
					<Label size="sm">Sem filtros ativos. A exportação irá usar todos os alertas da lista atual.</Label>
				)}
				{alertListExportContext.filters.map(({ label, value }) => (
					<div key={label}>
						<Label size="sm" caps>{label}</Label>
						<Text size="sm">{value}</Text>
					</div>
				))}
			</Section>
			<Divider />
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<Button label="Cancelar" onClick={closeAlertListExportModal} type="button" variant="secondary" />
					<Button
						disabled={!alertListExportContext.flags.CanSave}
						label="Exportar"
						loading={alertListExportContext.flags.loading}
						onClick={alertListExportContext.actions.exportAlerts}
						type="button"
					/>
				</Grid>
			</Section>
		</Pane>
	);
}

/***/

export const openAlertListExportModal = () => {
	openModal({
		children: (
			<DataProviders>
				<AlertsListContextProvider>
					<AlertsListExportContextProvider>
						<AlertListExportModal />
					</AlertsListExportContextProvider>
				</AlertsListContextProvider>
			</DataProviders>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeAlertListExportModal = () => {
	closeModal(MODAL_ID);
};

'use client';

import { Button, closeModal, Divider, Grid, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

import { useAlertsListExportContext } from '../AlertListExport.context';

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
						disabled={!alertListExportContext.flags.canSave}
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

/* * */

export const closeAlertListExportModal = () => {
	closeModal(MODAL_ID);
};

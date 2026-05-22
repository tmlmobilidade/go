'use client';

import { closeStopListExportModal } from '@/components/stops/list/StopListExportModal/StopListExport.modal';
import { useStopListExportContext } from '@/contexts/StopListExport.contex';
import { Button, Divider, Grid, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function StopListExportModal() {
	//

	//
	// A. Setup variables

	const stopListExportContext = useStopListExportContext();

	//
	// B. Render components

	return (
		<Pane
			header={[
				<Toolbar key="stop-list-export-toolbar">
					<Label size="lg" singleLine>Exportar paragens</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<Section gap="sm">
				<Label size="sm" caps>Filtros ativos na lista</Label>
				{stopListExportContext.filters.length === 0 && (
					<Label size="sm">Sem filtros ativos. A exportação irá usar todas as paragens da lista atual.</Label>
				)}
				{stopListExportContext.filters.map(({ label, value }) => (
					<div key={label}>
						<Label size="sm" caps>{label}</Label>
						<Text size="sm">{value}</Text>
					</div>
				))}
			</Section>
			<Divider />
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<Button label="Cancelar" onClick={closeStopListExportModal} type="button" variant="secondary" />
					<Button
						disabled={!stopListExportContext.flags.canSave}
						label="Exportar"
						loading={stopListExportContext.flags.loading}
						onClick={stopListExportContext.actions.exportStops}
						type="button"
					/>
				</Grid>
			</Section>
		</Pane>
	);
}

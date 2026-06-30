'use client';

import { closeZoneListExportModal } from '@/components/zones/list/ZoneListExportModal/ZoneListExport.modal';
import { useZonesListExportContext } from '@/contexts/ZonesExport.content';
import { Button, Divider, Grid, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ZoneListExportModal() {
	//

	//
	// A. Setup variables

	const zoneListExportContext = useZonesListExportContext();

	//
	// B. Render components

	return (
		<Pane
			header={[
				<Toolbar key="zone-list-export-toolbar">
					<Label size="lg" singleLine>Exportar zonas</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<Section gap="sm">
				<Label size="sm" caps>Filtros ativos na lista</Label>
				{zoneListExportContext.filters.length === 0 && (
					<Label size="sm">Sem filtros ativos. A exportação irá usar todas as zonas da lista atual.</Label>
				)}
				{zoneListExportContext.filters.map(({ label, value }) => (
					<div key={label}>
						<Label size="sm" caps>{label}</Label>
						<Text size="sm">{value}</Text>
					</div>
				))}
			</Section>
			<Divider />
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<Button label="Cancelar" onClick={closeZoneListExportModal} type="button" variant="secondary" />
					<Button
						disabled={!zoneListExportContext.flags.canSave}
						label="Exportar"
						loading={zoneListExportContext.flags.loading}
						onClick={zoneListExportContext.actions.exportZones}
						type="button"
					/>
				</Grid>
			</Section>
		</Pane>
	);
}

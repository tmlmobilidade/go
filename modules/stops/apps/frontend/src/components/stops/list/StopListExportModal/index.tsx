'use client';

import { closeStopListExportModal } from '@/components/stops/list/StopListExportModal/StopListExport.modal';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { Button, Grid, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListExportModal() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const activeFilters = useMemo(() => {
		const filters: Array<{ label: string, value: string }> = [];
		const searchValue = stopsListContext.filters.search.value.trim();

		if (searchValue.length > 0) {
			filters.push({ label: 'Pesquisa', value: searchValue });
		}

		if (stopsListContext.filters.lifecycle_status.isActive && stopsListContext.filters.lifecycle_status.value.length > 0) {
			filters.push({ label: 'Estado', value: stopsListContext.filters.lifecycle_status.value.join(', ') });
		}

		if (stopsListContext.filters.facilities.isActive && stopsListContext.filters.facilities.value.length > 0) {
			filters.push({ label: 'Serviços', value: stopsListContext.filters.facilities.value.join(', ') });
		}

		if (stopsListContext.filters.equipment.isActive && stopsListContext.filters.equipment.value.length > 0) {
			filters.push({ label: 'Equipamentos', value: stopsListContext.filters.equipment.value.join(', ') });
		}

		if (stopsListContext.filters.connections.isActive && stopsListContext.filters.connections.value.length > 0) {
			filters.push({ label: 'Conexões', value: stopsListContext.filters.connections.value.join(', ') });
		}

		return filters;
	}, [
		stopsListContext.filters.connections.isActive,
		stopsListContext.filters.connections.value,
		stopsListContext.filters.equipment.isActive,
		stopsListContext.filters.equipment.value,
		stopsListContext.filters.facilities.isActive,
		stopsListContext.filters.facilities.value,
		stopsListContext.filters.lifecycle_status.isActive,
		stopsListContext.filters.lifecycle_status.value,
		stopsListContext.filters.search.value,
	]);

	//
	// C. Render components

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
				{activeFilters.length === 0 && (
					<Text size="sm">Sem filtros ativos. A exportação irá usar todas as paragens da lista atual.</Text>
				)}
				{activeFilters.map(({ label, value }) => (
					<div key={label}>
						<Label size="sm" caps>{label}</Label>
						<Text size="sm">{value}</Text>
					</div>
				))}
			</Section>
			<Grid columns="ab" gap="sm">
				<Button label="Cancelar" onClick={closeStopListExportModal} type="button" variant="secondary" />
				<Button
					label="Exportar"
					type="button"
				/>
			</Grid>

		</Pane>
	);
}

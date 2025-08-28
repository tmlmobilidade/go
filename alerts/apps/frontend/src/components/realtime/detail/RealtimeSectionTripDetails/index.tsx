'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Button, Grid, Label, LineSelect, PillGroup, SearchInput, Section, Separator, StopSelect } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RealtimeSectionTripDetails() {
	//

	//
	// A. Setup variables
	const ridesContext = useRidesContext();

	// C. Render components

	return (
		<Section flexDirection="column" gap="sm">
			<Section flexDirection="column" gap="sm" padding="none">
				<Label>Filtros</Label>
				<SearchInput onChange={ridesContext.actions.setFilterSearch} size="xl" value={ridesContext.filters.search} />
				<Grid columns="ab" gap="sm">
					<LineSelect
						data={ridesContext.data.filteredLines}
						label="Linha"
						loading={ridesContext.flags.isFiltering}
						onSelectLineId={ridesContext.actions.setFilterLineId}
						selectedLineId={ridesContext.filters.lineId}
						variant="default"
					/>
					<StopSelect
						data={ridesContext.data.filteredStops}
						label="Paragem"
						loading={ridesContext.flags.isFiltering}
						onSelectStopId={ridesContext.actions.setFilterStopId}
						selectedStopId={ridesContext.filters.stopId}
						variant="default"
					/>
				</Grid>
			</Section>

			<Section flexDirection="column" gap="md" padding="none">
				<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
					<Label>Viagens encontradas</Label>
					<div className={styles.tripsActionsContainer}>
						<Button label="Adicionar Todas" onClick={ridesContext.actions.addAllRides} variant="primary" />
						<Button label="Limpar Filtros" onClick={ridesContext.actions.clearFilters} variant="danger" />
					</div>
				</Section>

				<div className={styles.tripsContainer}>
					<PillGroup data={ridesContext.data.rides.map(ride => ride._id)} onChange={ridesContext.actions.setSelectedRidesIds} selected={ridesContext.data.selectedRidesIds} size="xl" />
				</div>
			</Section>

			<Separator separatorType="dashed" />

			<Section flexDirection="column" gap="md" padding="none">
				<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
					<Label>Viagens selecionadas</Label>
					<div className={styles.tripsActionsContainer}>
						<Button label="Remover todas" onClick={ridesContext.actions.removeAllRides} variant="danger" />
					</div>
				</Section>
				<div className={styles.tripsContainer}>
					<PillGroup data={ridesContext.data.selectedRidesIds} onChange={ridesContext.actions.setSelectedRidesIds} selected={ridesContext.data.selectedRidesIds} size="xl" />
				</div>
			</Section>
		</Section>
	);
}

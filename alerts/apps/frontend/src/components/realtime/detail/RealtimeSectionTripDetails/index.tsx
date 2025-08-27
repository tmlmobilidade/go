'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { Badge, Button, Grid, Label, LineSelect, SearchInput, Section } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function RealtimeSectionTripDetails() {
	//

	//
	// A. Setup variables
	const [selectedLineId, setSelectedLineId] = useState<null | string>(null);

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const [search, setSearch] = useState('');

	//
	// C. Render components

	return (
		<Section flexDirection="column" gap="sm">
			<Section flexDirection="column" gap="sm" padding="none">
				<Label>Filtros</Label>
				<SearchInput onChange={setSearch} size="xl" value={search} />
				<Grid columns="ab" gap="sm">
					<LineSelect
						data={linesContext.data.lines}
						label="Linha"
						onSelectLineId={setSelectedLineId}
						selectedLineId={selectedLineId}
						variant="default"
					/>
				</Grid>
			</Section>

			<Section flexDirection="column" gap="md" padding="none">
				<Section alignItems="center" flexDirection="row" justifyContent="space-between" padding="none">
					<Label>Viagens encontradas</Label>
					<div className={styles.foundTripsActionsContainer}>
						<Button label="Adicionar Todas" variant="primary" />
						<Button label="Limpar Filtros" variant="danger" />
					</div>
				</Section>

				<div className={styles.foundTripsContainer}>
					<Badge size="sm" variant="muted">3001_0_1_0930_0959_1_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1000_1029_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1030_1059_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1100_1129_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1130_1159_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1200_1229_0_ESC_DU</Badge>
				</div>
			</Section>

			<Section flexDirection="column" gap="md" padding="none">
				<Label>Viagens selectionadas</Label>
				<div className={styles.selectedTripsContainer}>
					<Badge size="sm" variant="muted">3001_0_1_0930_0959_1_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1000_1029_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1030_1059_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1100_1129_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1130_1159_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1200_1229_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1230_1259_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1300_1329_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1330_1359_1_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1400_1429_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1430_1459_0_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1430_1459_1_ESC_DU</Badge>
					<Badge size="sm" variant="muted">3001_0_1_1500_1529_0_ESC_DU</Badge>
				</div>
			</Section>
		</Section>
	);
}

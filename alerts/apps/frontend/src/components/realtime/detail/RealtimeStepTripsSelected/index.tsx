'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Button, Label, PillGroup, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RealtimeStepTripsSelected() {
	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	//
	// B. Render components

	return (
		<Section flexDirection="column" gap="md" padding="none">
			<Section
				alignItems="center"
				flexDirection="row"
				justifyContent="space-between"
				padding="none"
			>
				<Label>Viagens selecionadas</Label>
				<div className={styles.tripsActionsContainer}>
					<Button
						label="Remover todas"
						onClick={ridesContext.actions.removeAllRides}
						variant="danger"
					/>
				</div>
			</Section>
			<div className={styles.tripsContainer}>
				<PillGroup
					data={ridesContext.data.selectedRidesIds}
					onChange={ridesContext.actions.setSelectedRidesIds}
					selected={ridesContext.data.selectedRidesIds}
					size="xl"
				/>
			</div>
		</Section>
	);
}

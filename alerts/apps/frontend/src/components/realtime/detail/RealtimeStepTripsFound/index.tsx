'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Button, Label, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { RideCard } from '../RideCard';

/* * */

export function RealtimeStepTripsFound() {
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
				<Label>Viagens encontradas</Label>
				<div className={styles.tripsActionsContainer}>
					<Button
						label="Adicionar Todas"
						onClick={ridesContext.actions.addAllRides}
						variant="primary"
					/>
					<Button
						label="Limpar Filtros"
						onClick={ridesContext.actions.clearFilters}
						variant="danger"
					/>
				</div>
			</Section>

			<div className={styles.tripsContainer}>
				{ridesContext.data.rides.map(ride => (
					<RideCard key={ride._id} ride={ride} />
				))}
			</div>
		</Section>
	);
}

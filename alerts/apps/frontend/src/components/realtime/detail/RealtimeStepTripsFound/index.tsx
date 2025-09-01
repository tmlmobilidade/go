'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { useRidesContext } from '@/contexts/Rides.context';
import { Button, Label, Section } from '@tmlmobilidade/ui';
import { ViewportList } from 'react-viewport-list';

import styles from './styles.module.css';

import { RideCard } from '../RideCard';

/* * */

export function RealtimeStepTripsFound() {
	//
	// A. Setup variables

	const ridesContext = useRidesContext();
	const realtimeContext = useRealtimeDetailContext();

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
						onClick={() => realtimeContext.actions.addAllTrips(ridesContext.data.rides)}
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
				<ViewportList items={ridesContext.data.rides}>
					{(ride, index) => (
						<RideCard
							key={index}
							onSelect={() => { realtimeContext.actions.toggleTripReference(ride); }}
							ride={ride}
							selected={realtimeContext.data.selectedRides.some(r => r._id === ride._id)}
						/>
					)}
				</ViewportList>
			</div>
		</Section>
	);
}

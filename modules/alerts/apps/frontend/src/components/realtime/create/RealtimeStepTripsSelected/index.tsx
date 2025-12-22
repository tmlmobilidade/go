'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { IconListCheck } from '@tabler/icons-react';
import { Button, Label, Section } from '@tmlmobilidade/ui';
import { ViewportList } from 'react-viewport-list';

import styles from './styles.module.css';

import { RideCard } from '../RideCard';

/* * */

export function RealtimeStepTripsSelected() {
	//
	// A. Setup variables

	const realtimeContext = useRealtimeCreateContext();

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
						onClick={realtimeContext.actions.removeAllRides}
						variant="danger"
					/>
				</div>
			</Section>
			<div className={styles.tripsContainer} data-empty={realtimeContext.data.selectedRides.length === 0}>
				{realtimeContext.data.selectedRides.length > 0 ? (
					<ViewportList items={realtimeContext.data.selectedRides}>
						{(ride, index) => (
							<RideCard
								key={index}
								onSelect={() => { realtimeContext.actions.toggleTripReference(ride); }}
								ride={ride}
								selected={index === realtimeContext.data.selectedRides.indexOf(ride)}
							/>
						)}
					</ViewportList>
				) : (
					<div className={styles.tripsContainerEmpty}>
						<IconListCheck size={56} />
						<Label size="lg" caps>Nenhuma viagem selecionada</Label>
					</div>
				)}
			</div>
		</Section>
	);
}

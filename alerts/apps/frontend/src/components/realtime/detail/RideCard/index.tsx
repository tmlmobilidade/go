/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { RidesData } from '@/contexts/Rides.context';
import { cn } from '@/lib/utils';
import { Grid, Label } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */
export function RideCard({ ride }: { ride: RidesData }) {
	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const line = linesContext.data.lines.find(line => line.id === ride.line_id.toString());
	const [isHovered, setIsHovered] = useState(false);

	//
	// B. Setup functions

	//
	// C. Render components
	const overlay = (
		<div className={styles.overlay}>
			<Label size="md">Selecionado</Label>
		</div>
	);

	return (
		<div className={styles.rideCard} onMouseLeave={() => setIsHovered(false)} onMouseOver={() => setIsHovered(true)}>
			<Label size="md">{ride._id}</Label>
			<Grid columns="ab" gap="xs">
				<Label size="sm">Linha: <span className={cn(styles.value, styles.line)} style={{ backgroundColor: line?.color }}>{line?.id}</span></Label>
				<Label size="sm">Percurso: <span className={styles.value}>{ride.headsign}</span></Label>
				<Label size="sm">Início: <span className={styles.value}>{Dates.fromUnixTimestamp(ride.start_time_scheduled).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt')}</span></Label>
				<Label size="sm">Fim: <span className={styles.value}>{Dates.fromUnixTimestamp(ride.end_time_scheduled).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt')}</span></Label>
				<Label size="sm">Motorista: <span className={styles.value}>{ride.vehicle_ids[0] ?? 'N/A'}</span></Label>
				<Label size="sm">Veículo: <span className={styles.value}>{ride.vehicle_ids[0]}</span></Label>
				<Label size="sm">Status: <span className={styles.value}>{ride.system_status}</span></Label>
				<Label size="sm">ID do Plano: <span className={styles.value}>{ride.trip_id}</span></Label>
			</Grid>

			{isHovered && overlay}
		</div>
	);
}

'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Collapsible, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailMetadata() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	return (
		<Collapsible description="Informações gerais sobre esta circulação" title="Metadados">
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label="Operador" value={ridesDetailContext.data.ride?.agency_id ?? 'N/A'} />
					<ValueDisplay label="Plano" value={ridesDetailContext.data.ride?.plan_id ?? 'N/A'} />
					<ValueDisplay label="Dia Operacional" value={ridesDetailContext.data.ride?.operational_date ?? 'N/A'} />
					<ValueDisplay label="Pattern ID" value={ridesDetailContext.data.ride?.pattern_id ?? 'N/A'} />
					<ValueDisplay label="Vehicle IDs" value={ridesDetailContext.data.ride?.vehicle_ids.join(', ') ?? 'N/A'} />
					<ValueDisplay label="Driver IDs" value={ridesDetailContext.data.ride?.driver_ids.join(', ') ?? 'N/A'} />
					<ValueDisplay label="Hora de Início Planeada" value={ridesDetailContext.data.ride?.start_time_scheduled_display ?? 'N/A'} />
					<ValueDisplay label="Hora de Início Observada" value={ridesDetailContext.data.ride?.start_time_observed_display ?? 'N/A'} />
					<ValueDisplay label="Atraso à Partida" value={ridesDetailContext.data.ride?.start_time_observed - ridesDetailContext.data.ride?.start_time_scheduled} />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}

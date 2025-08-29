'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Collapsible, Divider, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

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
					<ValueDisplay label="Dia Operacional" value={ridesDetailContext.data.ride?.operational_date ?? 'N/A'} bordered />
					<ValueDisplay label="Pattern ID" value={ridesDetailContext.data.ride?.pattern_id ?? 'N/A'} bordered />
					<ValueDisplay label="Trip ID" value={ridesDetailContext.data.ride?.trip_id ?? 'N/A'} bordered />
					<ValueDisplay label="Vehicle IDs" value={ridesDetailContext.data.ride?.vehicle_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label="Driver IDs" value={ridesDetailContext.data.ride?.driver_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label="Hora de Início Planeada" value={`${ridesDetailContext.data.ride?.start_time_scheduled_display} (${ridesDetailContext.data.ride?.start_time_scheduled})`} bordered />
					<ValueDisplay label="Hora de Início Observada" value={`${ridesDetailContext.data.ride?.start_time_observed_display} (${ridesDetailContext.data.ride?.start_time_observed})`} bordered />
					<ValueDisplay label="Atraso à Partida" value={ridesDetailContext.data.ride?.start_time_observed - ridesDetailContext.data.ride?.start_time_scheduled} bordered />
				</Grid>
			</Section>
			<Divider />
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label="Passageiros" value={ridesDetailContext.data.ride?.passengers_observed ?? 'N/A'} bordered />
					<ValueDisplay label="Validações (txs)" value={ridesDetailContext.data.ride?.apex_validations_qty ?? 'N/A'} bordered />
					<ValueDisplay label="Vendas a Bordo" value={`${(ridesDetailContext.data.ride?.apex_on_board_sales_amount ?? 0) / 100}€ (${ridesDetailContext.data.ride?.apex_on_board_sales_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label="Validações Passes" value={`${ridesDetailContext.data.ride?.apex_validations_prepaid_amount ?? 0} units (${ridesDetailContext.data.ride?.apex_validations_prepaid_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label="Validações Pré-Pago" value={`${ridesDetailContext.data.ride?.apex_validations_subscription_qty ?? 0}`} bordered />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}

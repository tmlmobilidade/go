'use client';

/* * */

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { Collapsible, Divider, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function RideAnalysisMetadata() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();

	//
	// B. Render components

	return (
		<Collapsible description="Informações gerais sobre esta circulação" title="Metadados">
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<ValueDisplay label="Dia Operacional" value={RideAnalysisContext.data.ride?.operational_date ?? 'N/A'} bordered />
					<ValueDisplay label="Pattern ID" value={RideAnalysisContext.data.ride?.pattern_id ?? 'N/A'} bordered />
					<ValueDisplay label="Trip ID" value={RideAnalysisContext.data.ride?.trip_id ?? 'N/A'} bordered />
					<ValueDisplay label="Vehicle IDs" value={RideAnalysisContext.data.ride?.vehicle_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label="Driver IDs" value={RideAnalysisContext.data.ride?.driver_ids.join(', ') ?? 'N/A'} bordered />
					<ValueDisplay label="Hora de Início Planeada" value={`${RideAnalysisContext.data.ride?.start_time_scheduled_display} (${RideAnalysisContext.data.ride?.start_time_scheduled})`} bordered />
					<ValueDisplay label="Hora de Início Observada" value={`${RideAnalysisContext.data.ride?.start_time_observed_display} (${RideAnalysisContext.data.ride?.start_time_observed})`} bordered />
					<ValueDisplay label="Atraso à Partida" value={RideAnalysisContext.data.ride?.start_delay_value_display ?? 'N/A'} bordered />
					<ValueDisplay label="Hora de Fim Planeada" value={`${RideAnalysisContext.data.ride?.end_time_scheduled_display} (${RideAnalysisContext.data.ride?.end_time_scheduled})`} bordered />
					<ValueDisplay label="Hora de Fim Observada" value={`${RideAnalysisContext.data.ride?.end_time_observed_display} (${RideAnalysisContext.data.ride?.end_time_observed})`} bordered />
					<ValueDisplay label="Atraso à Chegada" value={RideAnalysisContext.data.ride?.end_delay_value_display ?? 'N/A'} bordered />
				</Grid>
			</Section>
			<Divider />
			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label="Passageiros" value={RideAnalysisContext.data.ride?.passengers_observed ?? 'N/A'} bordered />
					<ValueDisplay label="Validações (APEX TXs)" value={RideAnalysisContext.data.ride?.apex_validations_qty ?? 'N/A'} bordered />
					<ValueDisplay label="Validações Passes" value={`${RideAnalysisContext.data.ride?.passengers_observed_subscription_qty ?? 0}`} bordered />
					<ValueDisplay label="Vendas a Bordo" value={`${(RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_amount ?? 0) / 100}€ (${RideAnalysisContext.data.ride?.passengers_observed_on_board_sales_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label="Validações Pré-Pago" value={`${RideAnalysisContext.data.ride?.passengers_observed_prepaid_amount ?? 0} units (${RideAnalysisContext.data.ride?.passengers_observed_prepaid_qty ?? 'N/A'})`} bordered />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}

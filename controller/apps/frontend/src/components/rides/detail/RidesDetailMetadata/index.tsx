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
					<ValueDisplay label="Passageiros" value={ridesDetailContext.data.ride?.passengers_observed ?? 'N/A'} bordered />
					<ValueDisplay label="Validações (APEX TXs)" value={ridesDetailContext.data.ride?.apex_validations_qty ?? 'N/A'} bordered />
					<ValueDisplay label="Validações Passes" value={`${ridesDetailContext.data.ride?.passengers_observed_subscription_qty ?? 0}`} bordered />
					<ValueDisplay label="Vendas a Bordo" value={`${(ridesDetailContext.data.ride?.passengers_observed_on_board_sales_amount ?? 0) / 100}€ (${ridesDetailContext.data.ride?.passengers_observed_on_board_sales_qty ?? 'N/A'})`} bordered />
					<ValueDisplay label="Validações Pré-Pago" value={`${ridesDetailContext.data.ride?.passengers_observed_prepaid_amount ?? 0} units (${ridesDetailContext.data.ride?.passengers_observed_prepaid_qty ?? 'N/A'})`} bordered />
				</Grid>

			</Section>
		</Collapsible>
	);

	//
}
